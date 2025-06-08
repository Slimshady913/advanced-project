from rest_framework import generics, permissions
from .models import BoardPost, BoardComment, BoardPostLike, BoardCommentLike, BoardCategory, BoardAttachment
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .serializers import (
    BoardPostSerializer, BoardCommentSerializer,
    BoardPostUpdateSerializer, BoardCategorySerializer
)
from rest_framework.permissions import IsAuthenticated, AllowAny
from reviews.permissions import IsOwnerOrReadOnly
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Count, Q
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

# ✅ 게시글 목록 조회 + 작성
class BoardPostListCreateView(generics.ListCreateAPIView):
    queryset = BoardPost.objects.all().order_by('-created_at').prefetch_related('attachments')
    serializer_class = BoardPostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @swagger_auto_schema(
        operation_summary="게시글 목록 조회",
        operation_description="전체 커뮤니티 게시글 목록을 최신순으로 반환합니다. 카테고리별로 게시글을 필터링할 수 있습니다.",
        manual_parameters=[
            openapi.Parameter(
                'category', openapi.IN_QUERY, description="카테고리 필터링 (예: '영화', '드라마', 'hot')", type=openapi.TYPE_STRING
            ),
            openapi.Parameter(
                'search_type', openapi.IN_QUERY, description="검색 타입 (title, title_content, user)", type=openapi.TYPE_STRING
            ),
            openapi.Parameter(
                'search', openapi.IN_QUERY, description="검색어", type=openapi.TYPE_STRING
            ),
            openapi.Parameter(
                'page', openapi.IN_QUERY, description="페이지 번호", type=openapi.TYPE_INTEGER
            ),
        ],
        responses={200: BoardPostSerializer(many=True)}
    )
    def get(self, request, *args, **kwargs):
        category_slug = self.request.query_params.get('category')
        min_like_count = 10
        queryset = self.get_queryset()

        if category_slug:
            if category_slug == 'hot':
                queryset = queryset.annotate(
                    like_count=Count('likes', filter=Q(likes__is_like=True))
                ).filter(
                    like_count__gte=min_like_count
                ).order_by('-like_count', '-created_at')
            else:
                queryset = queryset.filter(category__slug=category_slug)

        search_type = self.request.query_params.get("search_type")
        search = self.request.query_params.get("search")
        if search_type and search:
            if search_type == "title":
                queryset = queryset.filter(title__icontains=search)
            elif search_type == "title_content":
                queryset = queryset.filter(
                    Q(title__icontains=search) | Q(content__icontains=search)
                )
            elif search_type == "user":
                queryset = queryset.filter(user__username__icontains=search)

        self.queryset = queryset
        return super().get(request, *args, **kwargs)

    def perform_create(self, serializer):
        post = serializer.save(user=self.request.user)
        for file in self.request.FILES.getlist('media'):
            BoardAttachment.objects.create(post=post, file=file)

# ✅ 게시글 상세 조회 / 수정 / 삭제
class BoardPostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = BoardPost.objects.all()
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return BoardPostUpdateSerializer
        return BoardPostSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAuthenticated(), IsOwnerOrReadOnly()]
        return [AllowAny()]

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = request.data.copy()

        # 🔹 delete_attachments 처리
        delete_ids = []
        if 'delete_attachments' in data:
            try:
                raw = data.getlist('delete_attachments')  # 여러 개면 리스트로 처리
                delete_ids = [int(x) for x in raw]
            except (ValueError, TypeError):
                return Response({'delete_attachments': ['정수 리스트 형식이어야 합니다.']}, status=400)

        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # 🔹 삭제 대상 파일 삭제
        if delete_ids:
            attachments = BoardAttachment.objects.filter(id__in=delete_ids, post=instance)
            for att in attachments:
                att.file.delete(save=False)
                att.delete()

        # 🔹 새 첨부파일 추가
        for file in request.FILES.getlist('media'):
            BoardAttachment.objects.create(post=instance, file=file)

        return Response(BoardPostSerializer(instance, context={'request': request}).data)

# ✅ 댓글 목록 조회 + 작성
class BoardCommentListCreateView(generics.ListCreateAPIView):
    serializer_class = BoardCommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        post_id = self.kwargs['post_id']
        top_comments = BoardComment.objects.filter(
            post_id=post_id
        ).annotate(
            like_count=Count('likes', filter=Q(likes__is_like=True))
        ).filter(
            like_count__gte=10
        ).order_by('-like_count')[:3]

        other_comments = BoardComment.objects.filter(
            post_id=post_id
        ).exclude(id__in=top_comments).order_by('created_at')

        return top_comments | other_comments

    @swagger_auto_schema(
        operation_summary="댓글 목록 조회",
        operation_description="특정 게시글에 달린 댓글을 추천수 상위 3개를 먼저 조회하고, 그 외 댓글을 작성 순으로 조회합니다.",
        responses={200: BoardCommentSerializer(many=True)}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def perform_create(self, serializer):
        post_id = self.kwargs['post_id']
        serializer.save(user=self.request.user, post_id=post_id)

# ✅ 댓글 삭제
class BoardCommentDestroyView(generics.DestroyAPIView):
    queryset = BoardComment.objects.all()
    serializer_class = BoardCommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    @swagger_auto_schema(operation_summary="댓글 삭제")
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)

# ✅ 게시글 추천/비추천
class BoardPostLikeToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        post = get_object_or_404(BoardPost, pk=pk)
        is_like = request.data.get('is_like')

        BoardPostLike.objects.update_or_create(
            user=request.user, post=post,
            defaults={'is_like': is_like}
        )
        return Response({'status': 'updated', 'is_like': is_like})

# ✅ 댓글 추천/비추천
class BoardCommentLikeToggleView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="댓글 추천/비추천 토글",
        operation_description="댓글에 추천/비추천을 토글합니다.",
        responses={200: openapi.Response(description="추천/비추천 상태 업데이트됨", examples={"application/json": {"status": "updated", "is_like": True}})}
    )
    def post(self, request, pk):
        comment = get_object_or_404(BoardComment, pk=pk)
        is_like = request.data.get('is_like')

        BoardCommentLike.objects.update_or_create(
            user=request.user, comment=comment,
            defaults={'is_like': is_like}
        )
        return Response({'status': 'updated', 'is_like': is_like})

# ✅ 카테고리 목록 조회
class BoardCategoryListView(generics.ListAPIView):
    queryset = BoardCategory.objects.all()
    serializer_class = BoardCategorySerializer
from rest_framework import generics, permissions
from .models import BoardPost, BoardComment, BoardPostLike, BoardCommentLike
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .serializers import BoardPostSerializer, BoardCommentSerializer
from rest_framework.permissions import IsAuthenticated
from reviews.permissions import IsOwnerOrReadOnly  # 기존 권한 재사용

from django.db import models
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from rest_framework import generics
from .models import BoardCategory
from .serializers import BoardCategorySerializer
from django.db.models import Count, Q
from .models import BoardAttachment

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
        min_like_count = 10  # 인기 기준 추천수 (원하는 값으로 조정)
        queryset = self.get_queryset()

        # 카테고리 필터
        if category_slug:
            if category_slug == 'hot':
                # 인기글: 추천수 N개 이상 필터 + 추천순 정렬
                queryset = queryset.annotate(
                    like_count=Count('likes', filter=Q(likes__is_like=True))
                ).filter(
                    like_count__gte=min_like_count
                ).order_by('-like_count', '-created_at')
            else:
                queryset = queryset.filter(category__slug=category_slug)

        # 🔥 검색 파라미터 처리
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
    serializer_class = BoardPostSerializer
    #permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    permission_classes = [permissions.AllowAny]  # ✅ 임시로 완전히 공개!

    @swagger_auto_schema(operation_summary="게시글 상세 조회")
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @swagger_auto_schema(operation_summary="게시글 수정", request_body=BoardPostSerializer)
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

    @swagger_auto_schema(operation_summary="게시글 삭제")
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.view_count = (instance.view_count or 0) + 1
        instance.save(update_fields=['view_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


# ✅ 댓글 목록 조회 + 작성
class BoardCommentListCreateView(generics.ListCreateAPIView):
    serializer_class = BoardCommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        post_id = self.kwargs['post_id']
        top_comments = BoardComment.objects.filter(
    post_id=post_id
).annotate(
    like_count=models.Count('likes', filter=Q(likes__is_like=True))
).filter(
    like_count__gte=10        # 추천수 10개 이상
).order_by('-like_count')[:3]
        other_comments = BoardComment.objects.filter(post_id=post_id).exclude(id__in=top_comments).order_by('created_at')
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

# ✅ 댓글 삭제 (작성자만 가능)
class BoardCommentDestroyView(generics.DestroyAPIView):
    queryset = BoardComment.objects.all()
    serializer_class = BoardCommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    @swagger_auto_schema(operation_summary="댓글 삭제")
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)
    
class BoardPostLikeToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        post = get_object_or_404(BoardPost, pk=pk)
        is_like = request.data.get('is_like')

        like_obj, created = BoardPostLike.objects.update_or_create(
            user=request.user, post=post,
            defaults={'is_like': is_like}
        )
        return Response({'status': 'updated', 'is_like': is_like})

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

        like_obj, created = BoardCommentLike.objects.update_or_create(
            user=request.user, comment=comment,
            defaults={'is_like': is_like}
        )
        return Response({'status': 'updated', 'is_like': is_like})
    
    # ✅ 카테고리 목록 조회 API (READ ONLY)
class BoardCategoryListView(generics.ListAPIView):
    queryset = BoardCategory.objects.all()
    serializer_class = BoardCategorySerializer
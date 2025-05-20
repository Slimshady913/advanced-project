from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.filters import OrderingFilter
from django.db.models import Count
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import (
    Review, ReviewCommentReaction, ReviewHistory,
    ReviewComment, ReviewReaction, ReviewImage
)
from .serializers import (
    ReviewImageSerializer, ReviewSerializer, ReviewCommentSerializer,
    ReviewReactionSerializer, ReviewHistorySerializer
)
from .permissions import IsOwnerOrReadOnly

# ---------------------------------------------------------------------
# ✅ 리뷰 목록 조회 및 작성
# ---------------------------------------------------------------------
class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [OrderingFilter]
    ordering_fields = ['created_at', 'rating', 'like_count']
    ordering = ['-created_at']

    @swagger_auto_schema(
        operation_summary="리뷰 목록 조회",
        operation_description=(
            "영화 ID(movie)를 기준으로 필터링 가능하며, `ordering` 파라미터로 정렬 지원.\n"
            "- `-created_at`: 최신순\n- `-like_count`: 추천순\n- `rating`: 낮은 평점순"
        ),
        manual_parameters=[
            openapi.Parameter('movie', openapi.IN_QUERY, description="영화 ID", type=openapi.TYPE_INTEGER),
            openapi.Parameter('ordering', openapi.IN_QUERY, description="정렬 기준", type=openapi.TYPE_STRING),
        ],
        responses={200: ReviewSerializer(many=True)}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_summary="리뷰 작성",
        operation_description="특정 영화에 대해 평점과 코멘트를 작성합니다.",
        request_body=ReviewSerializer,
        responses={201: ReviewSerializer}
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

    def get_queryset(self):
        movie_id = self.request.query_params.get('movie')
        return Review.objects.filter(movie_id=movie_id) if movie_id else Review.objects.all()

    def perform_create(self, serializer):
        review = serializer.save(user=self.request.user)
        images = self.request.FILES.getlist('images')
        for image in images:
            ReviewImage.objects.create(review=review, image=image)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

# ---------------------------------------------------------------------
# ✅ 리뷰 상세 조회 / 수정 / 삭제 및 수정 이력 저장
# ---------------------------------------------------------------------
class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    @swagger_auto_schema(operation_summary="리뷰 상세 조회")
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @swagger_auto_schema(operation_summary="리뷰 수정", request_body=ReviewSerializer)
    def put(self, request, *args, **kwargs):
        instance = self.get_object()
        ReviewHistory.objects.create(
            review=instance,
            user=request.user,
            previous_rating=instance.rating,
            previous_comment=instance.comment
        )
        return super().put(request, *args, **kwargs)

    @swagger_auto_schema(operation_summary="리뷰 삭제")
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_update(self, serializer):
        review = serializer.save()
        # 새 이미지 파일 추가
        images = self.request.FILES.getlist('images')
        for image in images:
            ReviewImage.objects.create(review=review, image=image)
        # 삭제할 이미지 id 처리
        delete_image_ids = self.request.data.get('delete_image_ids', [])
        if isinstance(delete_image_ids, str):
            try:
                import json
                delete_image_ids = json.loads(delete_image_ids)
            except Exception:
                delete_image_ids = []
        for img_id in delete_image_ids:
            ReviewImage.objects.filter(id=img_id, review=review).delete()

# ---------------------------------------------------------------------
# ✅ 리뷰 이미지 개별 삭제 API
# ---------------------------------------------------------------------
class ReviewImageDestroyView(generics.DestroyAPIView):
    queryset = ReviewImage.objects.all()
    serializer_class = ReviewImageSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    @swagger_auto_schema(operation_summary="리뷰 이미지 삭제")
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)

# ---------------------------------------------------------------------
# ✅ 리뷰 추천/비추천 기능 (ReviewReaction)
# ---------------------------------------------------------------------
class ToggleReviewReaction(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="리뷰 추천/비추천 토글",
        operation_description="네이버 웹툰 스타일: 추천/비추천 토글 (1인 1표, 중복/반대 투표 반영)",
        responses={200: openapi.Response(description="성공")}
    )
    def post(self, request, review_id, reaction_type):
        user = request.user
        is_like = reaction_type == 'like'

        try:
            review = Review.objects.get(id=review_id)
        except Review.DoesNotExist:
            return Response({"error": "리뷰를 찾을 수 없습니다."}, status=404)

        try:
            reaction = ReviewReaction.objects.get(user=user, review=review)
            if reaction.is_like == is_like:
                reaction.delete()
                return Response({
                    "message": "투표가 취소되었습니다.",
                    "my_vote": 0,
                    "like_count": review.reactions.filter(is_like=True).count(),
                    "dislike_count": review.reactions.filter(is_like=False).count(),
                }, status=200)
            else:
                reaction.is_like = is_like
                reaction.save()
                return Response({
                    "message": "반응이 변경되었습니다.",
                    "my_vote": 1 if is_like else -1,
                    "like_count": review.reactions.filter(is_like=True).count(),
                    "dislike_count": review.reactions.filter(is_like=False).count(),
                }, status=200)
        except ReviewReaction.DoesNotExist:
            ReviewReaction.objects.create(user=user, review=review, is_like=is_like)
            return Response({
                "message": "투표가 반영되었습니다.",
                "my_vote": 1 if is_like else -1,
                "like_count": review.reactions.filter(is_like=True).count(),
                "dislike_count": review.reactions.filter(is_like=False).count(),
            }, status=201)

# ---------------------------------------------------------------------
# ✅ 리뷰 댓글 목록 조회 + 작성 (상위 3개 추천순 정렬 포함)
# ---------------------------------------------------------------------
class ReviewCommentListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewCommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    @swagger_auto_schema(
        operation_summary="댓글 목록 조회",
        operation_description="상위 3개는 추천순, 나머지는 작성순으로 정렬됩니다.",
        responses={200: ReviewCommentSerializer(many=True)}
    )
    def get(self, request, *args, **kwargs):
        review_id = self.kwargs.get('review_id')
        comments = ReviewComment.objects.filter(review_id=review_id)
        top_comments = comments.order_by('-like_count', '-created_at')[:3]
        remaining_comments = comments.exclude(id__in=top_comments).order_by('created_at')
        result = list(top_comments) + list(remaining_comments)
        serializer = self.get_serializer(result, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_summary="댓글 작성",
        request_body=ReviewCommentSerializer,
        responses={201: ReviewCommentSerializer}
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

    def perform_create(self, serializer):
        review = Review.objects.get(pk=self.kwargs.get('review_id'))
        serializer.save(user=self.request.user, review=review)

# ---------------------------------------------------------------------
# ✅ 댓글 삭제
# ---------------------------------------------------------------------
class ReviewCommentDestroyView(generics.DestroyAPIView):
    queryset = ReviewComment.objects.all()
    serializer_class = ReviewCommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    @swagger_auto_schema(operation_summary="댓글 삭제")
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)

# ---------------------------------------------------------------------
# ✅ 댓글 좋아요 기능 (ReviewCommentReaction)
# ---------------------------------------------------------------------
class ToggleReviewCommentReaction(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="리뷰 댓글 좋아요 토글",
        responses={
            200: openapi.Response(description="좋아요 취소됨"),
            201: openapi.Response(description="좋아요 등록됨")
        }
    )
    def post(self, request, comment_id):
        user = request.user
        try:
            comment = ReviewComment.objects.get(id=comment_id)
        except ReviewComment.DoesNotExist:
            return Response({"error": "댓글을 찾을 수 없습니다."}, status=404)

        reaction, created = ReviewCommentReaction.objects.get_or_create(user=user, comment=comment)
        if not created:
            reaction.delete()
            comment.like_count -= 1
            comment.save()
            return Response({'liked': False}, status=200)
        comment.like_count += 1
        comment.save()
        return Response({'liked': True}, status=201)

# ---------------------------------------------------------------------
# ✅ 리뷰 수정 이력 조회 API
# ---------------------------------------------------------------------
class ReviewHistoryListView(generics.ListAPIView):
    serializer_class = ReviewHistorySerializer
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="리뷰 수정 이력 조회",
        responses={200: ReviewHistorySerializer(many=True)}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        return ReviewHistory.objects.filter(review_id=self.kwargs.get('review_id')).order_by('-edited_at')

# ---------------------------------------------------------------------
# ✅ 리뷰 이미지 업로드 API
# ---------------------------------------------------------------------
class ReviewImageUploadView(generics.CreateAPIView):
    serializer_class = ReviewImageSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        review = Review.objects.get(pk=self.kwargs.get('review_id'))
        serializer.save(review=review)
from django.urls import path
from .views import (
    ReviewListCreateView,             # 리뷰 목록 조회 + 작성
    ReviewDetailView,                 # 리뷰 상세 조회, 수정, 삭제
    ToggleReviewReaction,             # 리뷰 추천/비추천 토글
    ReviewCommentListCreateView,      # 리뷰 댓글 목록 및 작성
    ReviewCommentDestroyView,         # 리뷰 댓글 삭제
    ToggleReviewCommentReaction,      # 리뷰 댓글 좋아요 토글
    ReviewHistoryListView,            # 리뷰 수정 이력 조회
    ReviewImageUploadView,             # 리뷰 이미지 업로드
    ReviewImageDestroyView,            # 리뷰 이미지 삭제
)

urlpatterns = [
    path('', ReviewListCreateView.as_view(), name='review-list-create'),
    path('<int:pk>/', ReviewDetailView.as_view(), name='review-detail'),
    # 👍 기존 좋아요 토글(path('<int:pk>/like/')) 라우트 **삭제**!!!
    path('<int:review_id>/<str:reaction_type>/', ToggleReviewReaction.as_view(), name='toggle-reaction'),
    path('<int:review_id>/comments/', ReviewCommentListCreateView.as_view(), name='review-comment-list-create'),
    path('comments/<int:pk>/', ReviewCommentDestroyView.as_view(), name='review-comment-delete'),
    path('comments/<int:comment_id>/like/', ToggleReviewCommentReaction.as_view(), name='comment-like-toggle'),
    path('<int:review_id>/history/', ReviewHistoryListView.as_view(), name='review-history'),
    path('<int:review_id>/images/', ReviewImageUploadView.as_view(), name='review-image-upload'),
    path('review-images/<int:pk>/', ReviewImageDestroyView.as_view(), name='review-image-destroy'),
]
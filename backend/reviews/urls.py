from django.urls import path
from .views import (
    ReviewListCreateView,             # 리뷰 목록 조회 + 작성
    ReviewDetailView,                 # 리뷰 상세 조회, 수정, 삭제
    ReviewLikeToggleView,             # 리뷰 좋아요 토글
    ToggleReviewReaction,             # 리뷰 추천/비추천 토글
    ReviewCommentListCreateView,     # 리뷰 댓글 목록 및 작성
    ReviewCommentDestroyView,        # 리뷰 댓글 삭제
    ToggleReviewCommentReaction,     # 리뷰 댓글 좋아요 토글
    ReviewHistoryListView,           # 리뷰 수정 이력 조회
    ReviewImageUploadView            # 리뷰 이미지 업로드
)

urlpatterns = [
    # ✅ 리뷰 전체 목록 조회 및 새 리뷰 작성
    path('', ReviewListCreateView.as_view(), name='review-list-create'),

    # ✅ 리뷰 상세 조회, 수정, 삭제
    path('<int:pk>/', ReviewDetailView.as_view(), name='review-detail'),

    # ✅ 특정 리뷰에 대한 추천/비추천 토글 (이 부분이 반드시 위에!)
    # POST /api/reviews/<review_id>/<reaction_type>/
    path('<int:review_id>/<str:reaction_type>/', ToggleReviewReaction.as_view(), name='toggle-reaction'),

    # ✅ 특정 리뷰에 대한 좋아요 토글 (이제 아래에 둬야 함!)
    # POST /api/reviews/<pk>/like/
    path('<int:pk>/like/', ReviewLikeToggleView.as_view(), name='review-like'),

    # ✅ 특정 리뷰의 댓글 목록 조회 및 댓글 작성
    path('<int:review_id>/comments/', ReviewCommentListCreateView.as_view(), name='review-comment-list-create'),

    # ✅ 특정 댓글 삭제 (작성자만 가능)
    path('comments/<int:pk>/', ReviewCommentDestroyView.as_view(), name='review-comment-delete'),

    # ✅ 특정 댓글 좋아요 토글
    path('comments/<int:comment_id>/like/', ToggleReviewCommentReaction.as_view(), name='comment-like-toggle'),

    # ✅ 리뷰 수정 이력 조회
    path('<int:review_id>/history/', ReviewHistoryListView.as_view(), name='review-history'),

    # ✅ 리뷰 이미지 업로드
    path('<int:review_id>/images/', ReviewImageUploadView.as_view(), name='review-image-upload'),
]
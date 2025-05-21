from django.urls import path
from .views import (
    BoardCategoryListView,
    BoardPostListCreateView,
    BoardPostDetailView,
    BoardCommentListCreateView,
    BoardCommentDestroyView,
    BoardPostLikeToggleView,
    BoardCommentLikeToggleView
)

urlpatterns = [
    # 카테고리 목록 조회
    path('categories/', BoardCategoryListView.as_view(), name='boardcategory-list'),
    # 게시글 목록 조회 및 작성
    path('posts/', BoardPostListCreateView.as_view(), name='boardpost-list-create'),
    
    # 게시글 상세 조회, 수정, 삭제
    path('posts/<int:pk>/', BoardPostDetailView.as_view(), name='boardpost-detail'),
    
    # 특정 게시글에 대한 댓글 목록 조회 및 댓글 작성
    path('posts/<int:post_id>/comments/', BoardCommentListCreateView.as_view(), name='boardcomment-list-create'),
    
    # 댓글 삭제 (작성자만)
    path('comments/<int:pk>/', BoardCommentDestroyView.as_view(), name='boardcomment-destroy'),
    
    # 게시글 좋아요/비추천 토글
    path('posts/<int:pk>/like/', BoardPostLikeToggleView.as_view(), name='boardpost-like-toggle'),
    
    # 댓글 좋아요/비추천 토글
    path('comments/<int:pk>/like/', BoardCommentLikeToggleView.as_view(), name='boardcomment-like-toggle'),
]
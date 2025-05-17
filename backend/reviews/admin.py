from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Review, ReviewComment,
    ReviewReaction, ReviewCommentReaction,
    ReviewHistory, ReviewImage
)

# ---------------------------------------------------------------------
# ✅ 리뷰 모델 관리자 설정
# ---------------------------------------------------------------------
@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'movie', 'rating', 'created_at', 'is_spoiler')
    list_filter = ('movie', 'created_at', 'is_spoiler')
    search_fields = ('user__username', 'movie__title', 'comment')
    ordering = ('-created_at',)


# ---------------------------------------------------------------------
# ✅ 리뷰 댓글 모델 관리자 설정
# ---------------------------------------------------------------------
@admin.register(ReviewComment)
class ReviewCommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'review', 'created_at', 'like_count')
    search_fields = ('user__username', 'content')
    ordering = ('-created_at',)

# ---------------------------------------------------------------------
# ✅ 리뷰 반응 모델 (좋아요/싫어요) 관리자 설정
# ---------------------------------------------------------------------
@admin.register(ReviewReaction)
class ReviewReactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'review', 'is_like', 'created_at')
    list_filter = ('is_like',)
    search_fields = ('user__username',)

# ---------------------------------------------------------------------
# ✅ 댓글 반응 모델 관리자 설정
# ---------------------------------------------------------------------
@admin.register(ReviewCommentReaction)
class ReviewCommentReactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'comment', 'created_at')
    search_fields = ('user__username',)

# ---------------------------------------------------------------------
# ✅ 리뷰 수정 이력 모델 관리자 설정
# ---------------------------------------------------------------------
@admin.register(ReviewHistory)
class ReviewHistoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'review', 'user', 'previous_rating', 'edited_at')
    search_fields = ('user__username', 'review__movie__title')
    ordering = ('-edited_at',)

# ---------------------------------------------------------------------
# ✅ 리뷰 이미지 모델 관리자 설정
# ---------------------------------------------------------------------
@admin.register(ReviewImage)
class ReviewImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'review', 'thumbnail_preview', 'uploaded_at')

    def thumbnail_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="100" height="auto" />', obj.image.url)
        return "-"
    thumbnail_preview.short_description = '미리보기'
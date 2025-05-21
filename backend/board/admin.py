from django.contrib import admin
from .models import BoardPost, BoardComment
from .models import BoardCategory


@admin.register(BoardPost)
class BoardPostAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'user', 'created_at')
    search_fields = ('title', 'content', 'user__username')
    list_filter = ('created_at',)
    ordering = ('-created_at',)

@admin.register(BoardComment)
class BoardCommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'post', 'user', 'content', 'created_at')
    search_fields = ('content', 'user__username')
    list_filter = ('created_at',)

@admin.register(BoardCategory)
class BoardCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'slug', 'description')  # slug 추가
    search_fields = ('name', 'slug')
from rest_framework import serializers
from .models import BoardPost, BoardComment, BoardPostLike, BoardCommentLike

# 게시글 시리얼라이저
class BoardPostSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    category = serializers.StringRelatedField()
    like_count = serializers.SerializerMethodField()

    class Meta:
        model = BoardPost
        fields = ['id', 'category', 'title', 'content', 'user', 'created_at', 'like_count']

    def get_like_count(self, obj):
        return obj.likes.count()

# 댓글 시리얼라이저
class BoardCommentSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = BoardComment
        fields = ['id', 'post', 'user', 'content', 'created_at']

# 게시글 좋아요/비추천 시리얼라이저
class BoardPostLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = BoardPostLike
        fields = ['id', 'user', 'post', 'is_like', 'created_at']

# 댓글 좋아요/비추천 시리얼라이저
class BoardCommentLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = BoardCommentLike
        fields = ['id', 'user', 'comment', 'is_like', 'created_at']
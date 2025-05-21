from rest_framework import serializers
from .models import BoardCategory, BoardPost, BoardComment, BoardPostLike, BoardCommentLike

# 게시글 시리얼라이저
class BoardPostSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    category = serializers.PrimaryKeyRelatedField(queryset=BoardCategory.objects.all())
    category_name = serializers.CharField(source='category.name', read_only=True)
    like_count = serializers.SerializerMethodField()
    my_like = serializers.SerializerMethodField()

    class Meta:
        model = BoardPost
        fields = ['id', 'category','category_name', 'title', 'content', 'user', 'created_at', 'like_count', 'my_like']

    def get_like_count(self, obj):
        # 추천(True)만 카운트
        return obj.likes.filter(is_like=True).count()
    
    def get_my_like(self, obj):
        user = self.context.get('request').user
        if user and user.is_authenticated:
            like = obj.likes.filter(user=user).first()
            # True=추천, False=비추천, None=아직 없음
            return like.is_like if like else None
        return None
    
class BoardCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BoardCategory
        fields = ['id', 'name', 'slug', 'description']  # slug 포함

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
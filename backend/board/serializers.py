from rest_framework import serializers
from .models import BoardCategory, BoardPost, BoardComment, BoardPostLike, BoardCommentLike

# 게시글 시리얼라이저
class BoardPostSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    category = serializers.PrimaryKeyRelatedField(queryset=BoardCategory.objects.all())
    category_name = serializers.CharField(source='category.name', read_only=True)
    like_count = serializers.SerializerMethodField()
    my_like = serializers.SerializerMethodField()
    dislike_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    view_count = serializers.IntegerField(read_only=True) 
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = BoardPost
        fields = ['id', 'category','category_name', 'title', 'content', 'user',
                   'created_at', 'dislike_count', 'comment_count', 'view_count', 'like_count', 'my_like'
                   , 'thumbnail_url']

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
    
    def get_dislike_count(self, obj):
        return obj.likes.filter(is_like=False).count()

    def get_comment_count(self, obj):
        return obj.comments.count()
    
    def get_thumbnail_url(self, obj):
        # 1. 첨부 이미지 모델이 있으면 그 중 첫 번째 반환 (예시)
        first_image = getattr(obj, 'images', None)
        if first_image and hasattr(first_image, 'first'):
            image_obj = first_image.first()
            if image_obj and hasattr(image_obj, 'image') and image_obj.image:
                return image_obj.image.url

        # 2. 본문(content)에 <img src=...>가 있다면 추출 (간단 예시)
        import re
        match = re.search(r'<img[^>]+src="([^">]+)"', obj.content or '')
        if match:
            return match.group(1)

        # 3. 없다면 None
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
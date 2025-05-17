from rest_framework import serializers
from .models import (
    Review, ReviewHistory, ReviewImage, ReviewLike,
    ReviewComment, ReviewReaction, ReviewCommentReaction
)

# ---------------------------------------------------------------------
# ✅ 리뷰 이미지 Serializer (이미지 업로드용)
# ---------------------------------------------------------------------
class ReviewImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewImage
        fields = ['id', 'image', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

# ---------------------------------------------------------------------
# ✅ 리뷰 Serializer: 평점, 코멘트, 스포일러, 이미지 등 포함
# ---------------------------------------------------------------------
class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    rating = serializers.FloatField(min_value=0.5, max_value=5.0)
    is_spoiler = serializers.BooleanField(default=False)
    like_count = serializers.SerializerMethodField()
    dislike_count = serializers.IntegerField(read_only=True)
    is_edited = serializers.SerializerMethodField()
    images = ReviewImageSerializer(many=True, read_only=True)
    def validate_rating(self, value):
        if value * 2 != int(value * 2):
            raise serializers.ValidationError("평점은 0.5점 단위로만 입력할 수 있습니다.")
        return value

    def get_like_count(self, obj):
        return obj.likes.count()

    def get_is_edited(self, obj):
        return obj.histories.exists()
    
    def validate(self, data):
        request = self.context.get('request')
        user = request.user if request else None
        movie = data.get('movie')

        # 생성일 때만(수정 제외)
        if self.instance is None and user and movie:
            if Review.objects.filter(user=user, movie=movie).exists():
                raise serializers.ValidationError("이미 이 영화에 대한 리뷰를 작성하셨습니다. 한 영화당 한 번만 리뷰 작성이 가능합니다.")
        return data

    class Meta:
        model = Review
        fields = [
            'id', 'user', 'movie', 'rating', 'comment', 'is_spoiler',
            'created_at', 'like_count', 'dislike_count', 'is_edited', 'images'
        ]
        read_only_fields = ['user', 'created_at', 'like_count', 'dislike_count', 'is_edited']

# ---------------------------------------------------------------------
# ✅ 리뷰 좋아요 Serializer (내부 로직 처리용)
# ---------------------------------------------------------------------
class ReviewLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewLike
        fields = ['id', 'user', 'review', 'created_at']

# ---------------------------------------------------------------------
# ✅ 리뷰 댓글 Serializer
# ---------------------------------------------------------------------
class ReviewCommentSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = ReviewComment
        fields = ['id', 'user', 'review', 'content', 'created_at']
        read_only_fields = ['user', 'review', 'created_at']

# ---------------------------------------------------------------------
# ✅ 댓글 좋아요 Serializer
# ---------------------------------------------------------------------
class ReviewCommentReactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewCommentReaction
        fields = ['id', 'user', 'comment', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

# ---------------------------------------------------------------------
# ✅ 리뷰 추천/비추천 Serializer
# ---------------------------------------------------------------------
class ReviewReactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewReaction
        fields = ['id', 'user', 'review', 'is_like', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

# ---------------------------------------------------------------------
# ✅ 리뷰 수정 이력 Serializer
# ---------------------------------------------------------------------
class ReviewHistorySerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = ReviewHistory
        fields = ['id', 'user', 'previous_rating', 'previous_comment', 'edited_at']
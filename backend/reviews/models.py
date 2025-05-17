from django.db import models
from django.contrib.auth import get_user_model
from movies.models import Movie

User = get_user_model()

# ---------------------------------------------------------------------
# ✅ 리뷰 모델: 영화에 대한 사용자 평가 저장
# ---------------------------------------------------------------------
class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # 리뷰 작성자
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='reviews')  # 대상 영화
    rating = models.FloatField() # 평점 (1~5)
    comment = models.TextField(blank=True)  # 코멘트 (선택 사항)
    created_at = models.DateTimeField(auto_now_add=True)  # 작성 일시
    updated_at = models.DateTimeField(auto_now=True)      # 수정 일시
    like_count = models.PositiveIntegerField(default=0)   # 좋아요 수
    dislike_count = models.PositiveIntegerField(default=0)  # 싫어요 수
    is_spoiler = models.BooleanField(default=False)       # 스포일러 여부

    def save(self, *args, **kwargs):
        """
        저장 시 영화의 평균 평점 자동 갱신
        """
        is_new_review = self._state.adding
        super().save(*args, **kwargs)
        if is_new_review or self._state.db == 'default':
            self.movie.update_average_rating()

    def delete(self, *args, **kwargs):
        """
        삭제 시에도 영화의 평균 평점 자동 갱신
        """
        movie = self.movie
        super().delete(*args, **kwargs)
        movie.update_average_rating()

    def __str__(self):
        return f"{self.user.username} - {self.movie.title} ({self.rating}점)"

# ---------------------------------------------------------------------
# ✅ 리뷰 좋아요 모델: 사용자-리뷰 좋아요 연결
# ---------------------------------------------------------------------
class ReviewLike(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'review')  # 중복 방지

    def __str__(self):
        return f"{self.user.username} ❤️ {self.review}"

# ---------------------------------------------------------------------
# ✅ 리뷰 댓글 모델
# ---------------------------------------------------------------------
class ReviewComment(models.Model):
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    like_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.user.username}: {self.content[:20]}"

# ---------------------------------------------------------------------
# ✅ 댓글 좋아요 모델
# ---------------------------------------------------------------------
class ReviewCommentReaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    comment = models.ForeignKey('ReviewComment', on_delete=models.CASCADE, related_name='reactions')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'comment')

    def __str__(self):
        return f"{self.user} 👍 Comment {self.comment.id}"

# ---------------------------------------------------------------------
# ✅ 리뷰 좋아요/싫어요 반응 모델
# ---------------------------------------------------------------------
class ReviewReaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    review = models.ForeignKey('Review', on_delete=models.CASCADE, related_name='reactions')
    is_like = models.BooleanField()  # True: 좋아요 / False: 싫어요
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'review')

    def __str__(self):
        return f"{self.user} {'👍' if self.is_like else '👎'} Review {self.review.id}"

# ---------------------------------------------------------------------
# ✅ 리뷰 수정 이력 모델
# ---------------------------------------------------------------------
class ReviewHistory(models.Model):
    review = models.ForeignKey('Review', on_delete=models.CASCADE, related_name='histories')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    previous_rating = models.FloatField()
    previous_comment = models.TextField()
    edited_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review {self.review.id} edited by {self.user.username} at {self.edited_at}"

# ---------------------------------------------------------------------
# ✅ 리뷰 이미지 첨부 모델
# ---------------------------------------------------------------------
class ReviewImage(models.Model):
    review = models.ForeignKey('Review', on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='review_images/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for Review {self.review.id}"
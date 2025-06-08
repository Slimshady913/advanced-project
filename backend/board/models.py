from django.db import models
from django.contrib.auth import get_user_model
from django.db.models import Avg, Count, Q

User = get_user_model()

# ✅ 게시판 카테고리 모델 (ex. 자유게시판, 영화 정보, 국내 드라마 등)
class BoardCategory(models.Model):
    name = models.CharField(max_length=50, unique=True, verbose_name="카테고리명")
    slug = models.SlugField(max_length=50, unique=True, verbose_name="슬러그")   # unique 제거
    description = models.TextField(blank=True, verbose_name="설명")

    def __str__(self):
        return self.name


# ✅ 게시글 모델
class BoardPost(models.Model):
    category = models.ForeignKey(
        BoardCategory,
        on_delete=models.CASCADE,
        related_name='posts',
        verbose_name="게시판 카테고리"
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="작성자")
    title = models.CharField(max_length=200, verbose_name="제목")
    content = models.TextField(verbose_name="내용")
    created_at = models.DateTimeField(auto_now_add=True)
    view_count = models.PositiveIntegerField(default=0, verbose_name="조회수")

    def __str__(self):
        return f"[{self.category.name}] {self.title}"

    # ✅ 일일 핫글 조회 메서드
    @classmethod
    def get_daily_hot_posts(cls):
        from django.utils import timezone
        from datetime import timedelta

        yesterday = timezone.now() - timedelta(days=1)
        return cls.objects.filter(created_at__gte=yesterday).annotate(
            like_count=Count('likes', filter=Q(likes__is_like=True))
        ).order_by('-like_count')

    # ✅ 월간 핫글 조회 메서드
    @classmethod
    def get_monthly_hot_posts(cls):
        from django.utils import timezone
        from datetime import timedelta

        thirty_days_ago = timezone.now() - timedelta(days=30)
        return cls.objects.filter(created_at__gte=thirty_days_ago).annotate(
            like_count=Count('likes', filter=Q(likes__is_like=True))
        ).order_by('-like_count')


# ✅ 댓글 모델
class BoardComment(models.Model):
    post = models.ForeignKey(BoardPost, on_delete=models.CASCADE, related_name='comments', verbose_name="게시글")
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="작성자")
    content = models.TextField(verbose_name="댓글 내용")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}: {self.content[:20]}"

    # ✅ 댓글 추천수로 정렬하는 메서드
    @classmethod
    def get_sorted_comments(cls, post_id):
        top_comments = cls.objects.filter(post_id=post_id).annotate(
            like_count=Count('likes', filter=Q(likes__is_like=True))
        ).order_by('-like_count')[:3]

        remaining_comments = cls.objects.filter(post_id=post_id).exclude(
            id__in=top_comments.values_list('id', flat=True)
        ).order_by('created_at')

        return list(top_comments) + list(remaining_comments)


# ✅ 게시글 추천/비추천 모델
class BoardPostLike(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(BoardPost, on_delete=models.CASCADE, related_name='likes')
    is_like = models.BooleanField(verbose_name="추천 여부 (True=추천 / False=비추천)")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'post')

    def __str__(self):
        return f"{self.user.username} {'👍' if self.is_like else '👎'} {self.post.title}"


# ✅ 댓글 추천/비추천 모델
class BoardCommentLike(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    comment = models.ForeignKey(BoardComment, on_delete=models.CASCADE, related_name='likes')
    is_like = models.BooleanField(verbose_name="추천 여부 (True=추천 / False=비추천)")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'comment')

    def __str__(self):
        return f"{self.user.username} {'👍' if self.is_like else '👎'} 댓글({self.comment.id})"
    
class BoardAttachment(models.Model):
    post = models.ForeignKey(BoardPost, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='board_attachments/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.file.name
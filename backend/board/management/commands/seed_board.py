from django.core.management.base import BaseCommand
from board.models import (
    BoardPost, BoardComment, BoardPostLike, BoardCommentLike, BoardCategory
)
from users.models import User
from django.utils import timezone
import random

class Command(BaseCommand):
    help = '커뮤니티 게시판 더미 데이터를 생성합니다.'

    def handle(self, *args, **kwargs):
        print("👤 사용자 생성")
        user1, _ = User.objects.get_or_create(username='user1', email='user1@example.com')
        user1.set_password('pass1234'); user1.save()
        user2, _ = User.objects.get_or_create(username='user2', email='user2@example.com')
        user2.set_password('pass1234'); user2.save()

        # ✅ 카테고리 생성
        category_names = ['자유', '국내 드라마', '해외 드라마', '국내 영화', '해외 영화']
        category_objects = {}
        for name in category_names:
            obj, _ = BoardCategory.objects.get_or_create(name=name)
            category_objects[name] = obj

        print("📝 게시글 생성")
        for i in range(1, 16):
            post = BoardPost.objects.create(
                title=f"더미 게시글 {i}",
                content=f"이것은 더미 게시글입니다. 번호: {i}",
                category=category_objects[random.choice(category_names)],
                user=random.choice([user1, user2]),
                created_at=timezone.now()
            )
            print(f"  - {post.title}")

            for j in range(3):
                comment = BoardComment.objects.create(
                    content=f"{post.title}의 댓글 {j+1}",
                    post=post,
                    user=random.choice([user1, user2])
                )
                # 댓글 좋아요 랜덤 추가
                if random.choice([True, False]):
                    BoardCommentLike.objects.create(
                        comment=comment,
                        user=random.choice([user1, user2]),
                        is_like=True
                    )

            # 게시글 좋아요 랜덤 추가
            if i % 2 == 0:
                BoardPostLike.objects.create(post=post, user=user1, is_like=True)
            if i % 3 == 0:
                BoardPostLike.objects.create(post=post, user=user2, is_like=True)

        print("✅ 더미 데이터 생성 완료")
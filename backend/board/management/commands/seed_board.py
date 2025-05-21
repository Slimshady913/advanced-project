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
        user_data = [
            ('user1', 'user1@example.com'),
            ('user2', 'user2@example.com'),
            ('user3', 'user3@example.com'),
        ]
        user_objects = []
        for username, email in user_data:
            user, _ = User.objects.get_or_create(username=username, email=email)
            user.set_password('pass1234'); user.save()
            user_objects.append(user)

        # ✅ 카테고리 생성 (slug 필드 포함)
        category_data = [
            ('자유', 'free'),
            ('국내 드라마', 'drama_kr'),
            ('해외 드라마', 'drama_intl'),
            ('국내 영화', 'movie_kr'),
            ('해외 영화', 'movie_intl'),
            ('핫딜', 'sale'),
        ]
        category_objects = {}
        for name, slug in category_data:
            obj, _ = BoardCategory.objects.get_or_create(
                name=name, defaults={'slug': slug}
            )
            if not obj.slug:
                obj.slug = slug
                obj.save()
            category_objects[name] = obj

        print("📝 게시글 생성")
        # 다양한 카테고리와 유저 조합으로 30개 게시글 생성
        for i in range(1, 31):
            cat_name = random.choice([d[0] for d in category_data])
            post = BoardPost.objects.create(
                title=f"[{cat_name}] 더미 게시글 {i}",
                content=f"이것은 더미 게시글입니다. 번호: {i}\n자동 생성 {random.randint(100,999)}",
                category=category_objects[cat_name],
                user=random.choice(user_objects),
                created_at=timezone.now() - timezone.timedelta(days=random.randint(0, 20))
            )
            print(f"  - {post.title}")

            # 게시글마다 1~5개의 댓글 생성
            for j in range(random.randint(1, 5)):
                comment = BoardComment.objects.create(
                    content=f"{post.title}의 댓글 {j+1}",
                    post=post,
                    user=random.choice(user_objects)
                )
                # 댓글 좋아요/비추천 - user 중복 없이 랜덤 샘플
                like_users = random.sample(user_objects, k=random.randint(0, len(user_objects)))
                for like_user in like_users:
                    BoardCommentLike.objects.create(
                        comment=comment,
                        user=like_user,
                        is_like=random.choice([True, False])
                    )

            # 게시글 좋아요/비추천 - user 중복 없이 랜덤 샘플
            like_users = random.sample(user_objects, k=random.randint(0, len(user_objects)))
            for like_user in like_users:
                BoardPostLike.objects.create(
                    post=post,
                    user=like_user,
                    is_like=random.choice([True, False])
                )

        print("✅ 더미 데이터 생성 완료 (게시글 30개, 유저 3명, 댓글/추천/비추천 랜덤)")
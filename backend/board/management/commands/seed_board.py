from django.core.management.base import BaseCommand
from board.models import BoardCategory, BoardPost, BoardComment, BoardPostLike
from django.contrib.auth import get_user_model
import random
from datetime import timedelta
from django.utils import timezone

class Command(BaseCommand):
    help = "200개의 게시글 더미 데이터(추천/비추천/댓글/조회수 포함)를 생성합니다."

    def handle(self, *args, **kwargs):
        User = get_user_model()
        # 추천/비추천용 더미 유저 많이 만들기
        usernames = [f"user{i}" for i in range(1, 151)]  # 유저 150명 생성
        users = []
        for username in usernames:
            user = User.objects.filter(username=username).first()
            if not user:
                user = User.objects.create_user(username=username, email=f"{username}@example.com", password="dummy1234")
            users.append(user)

        categories = list(BoardCategory.objects.all())
        if not categories:
            category_names = ["자유", "국내 드라마", "해외 드라마", "국내 영화", "해외 영화", "핫딜"]
            for name in category_names:
                slug = name.replace(" ", "_")
                categories.append(BoardCategory.objects.create(name=name, slug=slug))
            self.stdout.write(f"카테고리 {len(categories)}개 생성됨")

        dummy_titles = [
            "더미 게시글", "테스트용 제목", "임의의 글", "영화 추천", "드라마 감상", "정보 공유", "이벤트", "후기"
        ]
        dummy_contents = [
            "이것은 더미 데이터입니다.",
            "게시글 내용 예시입니다. 랜덤 생성.",
            "오늘 본 영화 너무 재밌었어요!",
            "정보 나눔 게시글.",
            "이 게시글은 자동 생성되었습니다.",
            "파이썬으로 더미 데이터 생성 중."
        ]
        comment_samples = [
            "좋은 글 감사합니다!", "재밌게 읽었습니다.", "질문 있습니다~", "공감합니다.", "정보 공유 고마워요."
        ]

        created_count = 0
        for i in range(200):  # 200개 게시글
            title = f"{random.choice(dummy_titles)} {i+1}"
            content = f"{random.choice(dummy_contents)} (No.{i+1})"
            user = random.choice(users)
            category = random.choice(categories)
            days_ago = random.randint(0, 30)
            hours_ago = random.randint(0, 23)
            created_at = timezone.now() - timedelta(days=days_ago, hours=hours_ago)
            view_count = random.randint(0, 300)

            post, created = BoardPost.objects.get_or_create(
                title=title,
                defaults={
                    "category": category,
                    "user": user,
                    "content": content,
                    "created_at": created_at,
                    "view_count": view_count,
                }
            )

            # 추천/비추천 유저 무작위로 추출 (0~100명)
            like_user_count = random.randint(0, 100)
            dislike_user_count = random.randint(0, 100)
            like_users = random.sample(users, like_user_count) if like_user_count <= len(users) else users
            remain_users = [u for u in users if u not in like_users]
            dislike_users = random.sample(remain_users, dislike_user_count) if dislike_user_count <= len(remain_users) else remain_users

            for like_user in like_users:
                BoardPostLike.objects.get_or_create(user=like_user, post=post, defaults={"is_like": True})
            for dislike_user in dislike_users:
                BoardPostLike.objects.get_or_create(user=dislike_user, post=post, defaults={"is_like": False})

            # 댓글 생성 (0~5개 랜덤)
            for _ in range(random.randint(0, 5)):
                comment_user = random.choice(users)
                comment_content = random.choice(comment_samples)
                BoardComment.objects.create(post=post, user=comment_user, content=comment_content)

            created_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"{created_count}개의 게시글(추천/비추천/댓글/조회수 포함) 더미 데이터가 생성되었습니다."))
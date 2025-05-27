from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


# ✅ 사용자 생성 로직을 담당하는 매니저 클래스
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        """
        일반 사용자 생성 메서드
        - 이메일은 필수 입력값입니다.
        - 비밀번호는 암호화되어 저장됩니다.
        """
        if not email:
            raise ValueError("이메일은 필수입니다.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # 비밀번호 암호화
        user.save()
        return user

    def create_superuser(self, email, password, **extra_fields):
        """
        관리자(superuser) 계정 생성 메서드
        - is_staff, is_superuser 필드를 True로 설정합니다.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


# ✅ 사용자 모델 정의
class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)                     # 로그인 ID로 사용할 이메일
    username = models.CharField(max_length=30, unique=True)                # 사용자 이름 또는 닉네임
    is_active = models.BooleanField(default=True)              # 탈퇴 여부
    is_staff = models.BooleanField(default=False)              # 관리자 권한 여부 (admin site 접근)

    # ✅ 구독한 OTT 플랫폼 (ManyToMany)
    subscribed_ott = models.ManyToManyField(
        'ott.OTT',                   # 문자열 참조: ott 앱의 OTT 모델
        blank=True,
        related_name='subscribers', # OTT에서 이 관계를 참조할 때 사용하는 이름
        verbose_name='구독 중인 OTT'
    )

    # ✅ 사용자 생성/관리 로직 연결
    objects = UserManager()

    # ✅ 사용자 인증에 사용할 필드 설정
    USERNAME_FIELD = 'email'             # 로그인 시 사용되는 ID
    REQUIRED_FIELDS = ['username']       # createsuperuser 시 추가 입력 필드

    def __str__(self):
        return self.email  # 관리 페이지에서 사용자 표시용
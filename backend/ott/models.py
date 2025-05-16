from django.db import models

# ✅ OTT 플랫폼 모델 (예: 넷플릭스, 디즈니+, 왓챠 등)
class OTT(models.Model):
    name = models.CharField(
        max_length=50,
        verbose_name="플랫폼 이름",
        help_text="OTT 플랫폼 이름입니다. 예: Netflix, Watcha, Disney+"
    )
    logo_url = models.URLField(
        blank=True,
        verbose_name="로고 이미지 URL",
        help_text="OTT 플랫폼의 로고 이미지 URL입니다 (선택사항)"
    )
    link_url = models.URLField(
        blank=True,
        verbose_name="바로가기 링크 URL",
        help_text="OTT 플랫폼 영화 상세페이지로 이동할 수 있는 URL입니다 (선택사항)"
    )

    def __str__(self):
        return self.name  # 관리자 페이지에서 객체 표시 시 이름 출력
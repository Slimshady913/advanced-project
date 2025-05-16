from rest_framework import serializers
from .models import OTT

# ✅ OTT 플랫폼 정보를 직렬화하는 Serializer
class OTTSerializer(serializers.ModelSerializer):
    name = serializers.CharField(help_text="OTT 플랫폼 이름 (예: Netflix)")
    logo_url = serializers.URLField(help_text="OTT 로고 이미지 URL")
    link_url = serializers.URLField(help_text="OTT 영화 바로가기 URL", required=False, allow_blank=True)

    class Meta:
        model = OTT
        fields = ['id', 'name', 'logo_url', 'link_url']

        # Swagger 문서에서 다른 앱의 OTT와 충돌 방지를 위한 고유 이름 지정
        ref_name = 'OTTApp_OTT'
from rest_framework import serializers
from .models import Movie
from ott.models import OTT
from reviews.serializers import ReviewSerializer


# ✅ OTT 플랫폼 정보 (중복 방지용 ref_name 사용)
class OTTSerializer(serializers.ModelSerializer):
    class Meta:
        model = OTT
        fields = ['id', 'name', 'logo_url']
        ref_name = 'MovieApp_OTT'  # Swagger에서 ott.serializers.OTTSerializer와 충돌 방지


# ✅ 영화 정보 직렬화
class MovieSerializer(serializers.ModelSerializer):
    # 여러 OTT 플랫폼과 연결 (M2M 관계)
    ott_services = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=OTT.objects.all(),
        help_text="이 영화를 제공하는 OTT ID 리스트 (예: [1, 2])"
    )

    # 영화에 달린 리뷰들 (read-only)
    reviews = ReviewSerializer(many=True, read_only=True)

    # 평균 평점 (read-only, 1자리 반올림)
    average_rating = serializers.SerializerMethodField(
        help_text="영화의 평균 평점 (소수점 첫째자리까지)"
    )

    class Meta:
        model = Movie
        fields = [
            'id',
            'title',
            'description',
            'release_date',
            'thumbnail_url',
            'ott_services',
            'reviews',
            'average_rating'
        ]

    def get_average_rating(self, obj):
        """
        리뷰 기반 평균 평점을 계산해 소수점 1자리로 반환
        """
        return round(obj.calculate_average_rating(), 1)
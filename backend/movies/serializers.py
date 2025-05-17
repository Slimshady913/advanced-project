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
    ott_services = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=OTT.objects.all(),
        help_text="이 영화를 제공하는 OTT ID 리스트 (예: [1, 2])"
    )

    # [변경] 리뷰는 반드시 context와 함께 ReviewSerializer에 넘겨야 함!
    reviews = serializers.SerializerMethodField()

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
        return round(obj.calculate_average_rating(), 1)

    def get_reviews(self, obj):
        # context=self.context 를 반드시 전달!
        return ReviewSerializer(obj.reviews.all(), many=True, context=self.context).data
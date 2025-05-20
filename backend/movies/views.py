from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.generics import ListAPIView
from rest_framework.filters import SearchFilter, OrderingFilter 
from django_filters.rest_framework import DjangoFilterBackend

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import Movie
from .serializers import MovieSerializer
from .filters import MovieFilter
from django.db.models import Count

# ✅ 영화 목록 조회 (정렬 가능)
class MovieListView(generics.ListAPIView):
    serializer_class = MovieSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.OrderingFilter]

    # ✅ 수정: 존재하는 필드 이름으로 교체
    ordering_fields = ['average_rating_cache', 'release_date', 'title', 'review_count']
    ordering = ['-average_rating_cache']

    @swagger_auto_schema(
        operation_summary="영화 목록 조회",
        operation_description="등록된 영화 목록을 조회합니다. 평균 평점, 출시일, 제목 기준으로 정렬할 수 있습니다.",
        manual_parameters=[
            openapi.Parameter(
                'ordering',
                openapi.IN_QUERY,
                description="정렬 기준 (`average_rating_cache`, `release_date`, `title`)",
                type=openapi.TYPE_STRING
            )
        ],
        responses={200: MovieSerializer(many=True)}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        return (
            Movie.objects.annotate(review_count=Count('reviews'))
            .prefetch_related('reviews', 'ott_services')
        )


# ✅ 영화 등록
class MovieCreateView(generics.CreateAPIView):
    serializer_class = MovieSerializer
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="영화 등록",
        operation_description="새로운 영화를 등록합니다. `ott_services`는 연결할 OTT ID 리스트입니다.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["title", "description", "release_date", "thumbnail_url", "ott_services"],
            properties={
                "title": openapi.Schema(type=openapi.TYPE_STRING, description="영화 제목"),
                "description": openapi.Schema(type=openapi.TYPE_STRING, description="영화 설명"),
                "release_date": openapi.Schema(type=openapi.TYPE_STRING, format="date", description="개봉일"),
                "thumbnail_url": openapi.Schema(type=openapi.TYPE_STRING, format="uri", description="썸네일 이미지 URL"),
                "ott_services": openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Items(type=openapi.TYPE_INTEGER),
                    description="연결할 OTT ID 배열 (예: [1, 2])"
                ),
            }
        ),
        responses={201: MovieSerializer}
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

    def perform_create(self, serializer):
        movie = serializer.save()
        ott_ids = self.request.data.get('ott_services', [])
        movie.ott_services.set(ott_ids)

        # 평점 캐시 기본값 설정 (영화 등록 시 평점은 기본값 0으로 설정)
        movie.average_rating_cache = 0.0
        movie.save()


# ✅ 영화 상세 조회
class MovieDetailView(generics.RetrieveAPIView):
    serializer_class = MovieSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    @swagger_auto_schema(
        operation_summary="영화 상세 조회",
        operation_description="특정 영화의 상세 정보를 조회합니다.",
        responses={200: MovieSerializer}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        return Movie.objects.prefetch_related('reviews__user', 'ott_services')


# ✅ 영화 수정 및 삭제
class MovieDetailEditDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    @swagger_auto_schema(operation_summary="영화 상세 조회")
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_summary="영화 정보 수정",
        request_body=MovieSerializer,
        responses={200: MovieSerializer}
    )
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

    @swagger_auto_schema(operation_summary="영화 삭제")
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)


# ✅ 영화 검색 (제목 검색 + OTT 필터)
class MovieSearchView(ListAPIView):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    filter_backends = [SearchFilter, DjangoFilterBackend, OrderingFilter] 
    search_fields = ['title']
    filterset_class = MovieFilter
    ordering_fields = ['average_rating_cache', 'release_date', 'title',  'review_count']
    ordering = ['-average_rating_cache']

    @swagger_auto_schema(
        operation_summary="영화 검색",
        operation_description="영화 제목으로 검색하고, 제공 OTT 기준으로 필터링할 수 있습니다.",
        manual_parameters=[
            openapi.Parameter(
                'search',
                openapi.IN_QUERY,
                description="영화 제목 키워드 (부분 검색 가능)",
                type=openapi.TYPE_STRING
            ),
            openapi.Parameter(
                'ott_services',
                openapi.IN_QUERY,
                description="OTT ID 필터링 (여러 개일 경우 `,`로 구분, 예: `1,2`)",
                type=openapi.TYPE_STRING
            )
        ],
        responses={200: MovieSerializer(many=True)}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
    
    def get_queryset(self):
        return (
            Movie.objects.annotate(review_count=Count('reviews'))
            .prefetch_related('reviews', 'ott_services')
        )
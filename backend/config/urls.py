from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from users.views import CookieTokenObtainPairView

# ✅ Django REST Framework 권한 설정
from rest_framework import permissions

# ✅ JWT 인증 관련 View (SimpleJWT)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,    # 로그인 - Access, Refresh 토큰 발급
    TokenRefreshView        # Refresh 토큰을 통한 Access 갱신
)

# ✅ Swagger / ReDoc 문서화 설정
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework_simplejwt.authentication import JWTAuthentication  # Swagger 내 인증 처리용

# 📘 Swagger 스키마 정보 정의
schema_view = get_schema_view(
    openapi.Info(
        title="🎬 Movie Review API",
        default_version='v1',
        description="영화 리뷰 웹사이트의 Django REST API 문서입니다.",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="youremail@example.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
    authentication_classes=(JWTAuthentication,),  # Swagger UI 내 토큰 인증 테스트 가능
)

# ✅ URL 라우팅 정의
urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),

    # Swagger / Redoc 문서
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

    # JWT 인증 API
    path('api/token/', CookieTokenObtainPairView.as_view(), name='token_obtain_pair'),      # 로그인
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),      # 토큰 재발급

    # 앱별 API 라우팅
    path('api/users/', include('users.urls')),       # 사용자 기능
    path('api/ott/', include('ott.urls')),           # OTT 플랫폼
    path('api/movies/', include('movies.urls')),     # 영화 기능
    path('api/reviews/', include('reviews.urls')),   # 리뷰 / 댓글 / 추천
    path('api/board/', include('board.urls')),       # 커뮤니티 게시판
]

# ✅ 개발 환경에서 미디어 파일 서빙 설정
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
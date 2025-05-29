from django.urls import path
from .views import (
    RegisterView, ProfileView, subscribe_ott, update_profile,
    CookieTokenObtainPairView, LogoutView, CookieTokenRefreshView  # ✅ 추가
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CookieTokenObtainPairView.as_view(), name='login'),  # ✅ 로그인 (쿠키 발급)
    path('logout/', LogoutView.as_view(), name='logout'),  # ✅ 로그아웃 (쿠키 삭제)
    path('token/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('subscribe/', subscribe_ott, name='subscribe-ott'), 
    path('update/', update_profile, name='update-profile'),
]
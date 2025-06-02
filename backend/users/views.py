from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework_simplejwt.views import TokenRefreshView
from .serializers import RegisterSerializer
from ott.models import OTT

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from rest_framework_simplejwt.views import TokenObtainPairView

import requests
from django.conf import settings

def verify_recaptcha(token):
    url = 'https://www.google.com/recaptcha/api/siteverify'
    params = {
        'secret': settings.RECAPTCHA_SECRET_KEY,
        'response': token,
    }
    print("==== reCAPTCHA SECRET_KEY:", settings.RECAPTCHA_SECRET_KEY)
    r = requests.post(url, data=params)
    print("==== reCAPTCHA 응답:", r.json())
    return r.json().get('success', False)

# ✅ 회원가입 API 클래스
class RegisterView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="회원가입",
        operation_description="email, username, password를 입력하여 회원가입을 진행합니다.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["email", "username", "password"],
            properties={
                "email": openapi.Schema(type=openapi.TYPE_STRING, format="email", description="이메일"),
                "username": openapi.Schema(type=openapi.TYPE_STRING, description="사용자명"),
                "password": openapi.Schema(type=openapi.TYPE_STRING, format="password", description="비밀번호"),
            },
        ),
        responses={201: openapi.Response(description="회원가입 성공")}
    )
    def post(self, request):
        # 1. 프론트에서 보낸 캡챠 토큰 추출
        captcha_token = request.data.get('captcha')
        if not captcha_token or not verify_recaptcha(captcha_token):
            return Response({'captcha': '로봇이 아님을 인증해주세요.'}, status=status.HTTP_400_BAD_REQUEST)

        # 2. 이후 기존 회원가입 로직
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "회원가입 성공!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ✅ 로그인 시 JWT를 HttpOnly 쿠키에 설정
class CookieTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            access = response.data.get("access")
            refresh = response.data.get("refresh")

            # ✅ 새 Response 객체 생성
            res = Response({"message": "로그인 성공"}, status=status.HTTP_200_OK)

            res.set_cookie(
                key="access_token",
                value=access,
                httponly=True,
                samesite="Lax",
                secure=False,  # ✅ 개발환경에서 반드시 False
                max_age=300
            )
            res.set_cookie(
                key="refresh_token",
                value=refresh,
                httponly=True,
                samesite="Lax",
                secure=False,
                max_age=86400
            )

            return res  # ✅ 꼭 이 새 res 리턴

        return response

class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            return Response({"detail": "No refresh token provided"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data={"refresh": refresh_token})

        try:
            serializer.is_valid(raise_exception=True)
        except InvalidToken as e:
            return Response({"detail": "Refresh token is invalid or expired"}, status=status.HTTP_401_UNAUTHORIZED)

        return Response(serializer.validated_data, status=status.HTTP_200_OK)
    
# ✅ 로그아웃 (쿠키 삭제)
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="로그아웃",
        operation_description="access, refresh 토큰 쿠키를 삭제하여 로그아웃합니다.",
        responses={200: openapi.Response(description="로그아웃 성공")}
    )
    def post(self, request):
        res = Response({"message": "로그아웃 완료"}, status=200)
        res.delete_cookie("access_token")
        res.delete_cookie("refresh_token")
        return res


# ✅ 로그인한 사용자의 프로필 조회
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="프로필 조회",
        operation_description="로그인한 사용자의 이메일, 사용자명, 구독한 OTT 목록을 반환합니다.",
        responses={200: openapi.Response(
            description="사용자 프로필 정보",
            examples={
                "application/json": {
                    "email": "example@example.com",
                    "username": "exampleuser",
                    "subscribed_ott": [
                        {"id": 1, "name": "Netflix", "logo_url": "https://..."},
                        {"id": 2, "name": "Disney+", "logo_url": "https://..."}
                    ]
                }
            }
        )}
    )
    def get(self, request):
        user = request.user
        return Response({
            "email": user.email,
            "username": user.username,
            "subscribed_ott": [
                {
                    "id": ott.id,
                    "name": ott.name,
                    "logo_url": ott.logo_url
                } for ott in user.subscribed_ott.all()
            ]
        })


# ✅ OTT 구독 설정 API (사용자별로 구독한 OTT 목록을 설정)
@swagger_auto_schema(
    method='post',
    operation_summary="OTT 구독 설정",
    operation_description="사용자가 구독할 OTT 플랫폼 ID 목록을 설정합니다.",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['ott_ids'],
        properties={
            'ott_ids': openapi.Schema(
                type=openapi.TYPE_ARRAY,
                items=openapi.Items(type=openapi.TYPE_INTEGER),
                description='구독할 OTT ID 배열 (예: [1, 2])'
            )
        }
    ),
    responses={200: openapi.Response(
        description="구독 정보가 갱신되었습니다.",
        examples={"application/json": {"message": "구독 정보가 갱신되었습니다."}}
    )}
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def subscribe_ott(request):
    ott_ids = request.data.get('ott_ids', [])
    if not isinstance(ott_ids, list):
        return Response({'error': 'ott_ids는 리스트여야 합니다.'}, status=400)

    user = request.user
    user.subscribed_ott.set(ott_ids)
    return Response({'message': '구독 정보가 갱신되었습니다.'})


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    username = request.data.get('username')
    if username:
        user.username = username
        user.save()
        return Response({'message': '프로필이 수정되었습니다.'})
    return Response({'error': '닉네임이 없습니다.'}, status=400)
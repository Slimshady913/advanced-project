from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from .serializers import RegisterSerializer
from ott.models import OTT

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.permissions import AllowAny

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
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "회원가입 성공!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
from rest_framework import serializers
from .models import User


# ✅ 회원가입에 사용되는 직렬화 클래스
class RegisterSerializer(serializers.ModelSerializer):
    # 비밀번호는 write_only로 설정 (응답에 포함되지 않도록)
    password = serializers.CharField(
        write_only=True,
        help_text="비밀번호는 8자 이상 입력해야 합니다."  # Swagger에 표시됨
    )

    class Meta:
        model = User
        fields = ['email', 'username', 'password']
        extra_kwargs = {
            'email': {
                'help_text': '사용자의 이메일 주소입니다.',
                'required': True
            },
            'username': {
                'help_text': '사용자의 닉네임 또는 아이디입니다.',
                'required': True
            },
        }

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("이미 사용 중인 사용자명입니다.")
        return value

    def create(self, validated_data):
        """
        유효성 검사를 마친 데이터로 새 사용자를 생성합니다.
        create_user()는 비밀번호 해싱도 자동 처리합니다.
        """
        user = User.objects.create_user(**validated_data)
        return user
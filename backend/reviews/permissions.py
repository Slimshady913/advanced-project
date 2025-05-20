from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    ✅ 객체 단위 커스텀 권한:
    - 안전한 요청(GET, HEAD, OPTIONS)은 모든 사용자에게 허용
    - 그 외 요청(PUT, DELETE 등)은 객체 작성자에게만 허용
    """

    def has_object_permission(self, request, view, obj):
        # 안전한 요청이면 항상 허용
        if request.method in permissions.SAFE_METHODS:
            return True

        # 객체가 Review라면
        if hasattr(obj, 'user'):
            return obj.user == request.user
        # 객체가 ReviewImage라면 (review 필드가 있고, 그 review의 user가 요청자여야 함)
        if hasattr(obj, 'review') and hasattr(obj.review, 'user'):
            return obj.review.user == request.user
        # 객체가 ReviewComment라면 (필요시 추가)
        if hasattr(obj, 'review') and hasattr(obj.review, 'user'):
            return obj.review.user == request.user
        # 추가적으로 다른 객체가 있다면 그에 맞는 소유권 체크 추가

        return False
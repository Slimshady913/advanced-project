from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    ✅ 객체 단위 커스텀 권한:
    - 안전한 요청(GET, HEAD, OPTIONS)은 모든 사용자에게 허용
    - 그 외 요청(PUT, DELETE 등)은 객체 작성자에게만 허용
    """

    def has_object_permission(self, request, view, obj):
        print("Method:", request.method)
        print("Request User:", request.user)
        print("Object:", obj)
        # Review
        if hasattr(obj, 'user'):
            print("Review User:", obj.user)
            return obj.user == request.user
        # ReviewImage
        if hasattr(obj, 'review') and hasattr(obj.review, 'user'):
            print("ReviewImage Review User:", obj.review.user)
            return obj.review.user == request.user
        return False
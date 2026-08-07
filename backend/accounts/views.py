from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db.models import Sum
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from courses.models import Course
from orders.models import Order
from payment.models import Payment
from security.throttles import AuthRateThrottle
from .permissions import IsAdminRole
from .serializers import LoginSerializer, RegisterSerializer


User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)
    throttle_classes = (AuthRateThrottle,)


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer
    throttle_classes = (AuthRateThrottle,)


class RefreshTokenView(TokenRefreshView):
    throttle_classes = (AuthRateThrottle,)


class LogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    throttle_classes = (AuthRateThrottle,)

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"refresh": "This field is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            return Response({"refresh": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        return Response(status=status.HTTP_205_RESET_CONTENT)


class AdminDashboardView(APIView):
    permission_classes = (permissions.IsAuthenticated, IsAdminRole)

    def get(self, request):
        total_revenue = Order.objects.filter(status=Order.Status.PAID).aggregate(total=Sum("total_amount"))["total"] or Decimal("0.00")

        return Response(
            {
                "total_users": User.objects.count(),
                "total_students": User.objects.filter(role=User.Role.STUDENT).count(),
                "total_instructors": User.objects.filter(role=User.Role.INSTRUCTOR).count(),
                "total_courses": Course.objects.count(),
                "published_courses": Course.objects.filter(status=Course.Status.PUBLISHED).count(),
                "total_revenue": total_revenue,
                "total_orders": Order.objects.count(),
                "pending_payments": Payment.objects.filter(status=Payment.Status.PENDING).count(),
                "platform_statistics": {
                    "draft_courses": Course.objects.filter(status=Course.Status.DRAFT).count(),
                    "paid_orders": Order.objects.filter(status=Order.Status.PAID).count(),
                    "pending_orders": Order.objects.filter(status=Order.Status.PENDING).count(),
                    "completed_payments": Payment.objects.filter(status=Payment.Status.COMPLETED).count(),
                },
            },
            status=status.HTTP_200_OK,
        )

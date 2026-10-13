from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db.models import Q, Sum
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
from .serializers import LoginSerializer, RegisterSerializer, UserAdminSerializer


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
            if hasattr(token, "blacklist"):
                token.blacklist()
        except TokenError:
            return Response({"refresh": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            pass

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


class UserAdminListView(generics.ListCreateAPIView):
    serializer_class = UserAdminSerializer
    permission_classes = (permissions.IsAuthenticated, IsAdminRole)

    def get_queryset(self):
        queryset = User.objects.all().order_by("-date_joined")
        role_param = (self.request.query_params.get("role") or "").strip().lower()
        search_param = (self.request.query_params.get("search") or "").strip()

        if role_param:
            queryset = queryset.filter(role=role_param)

        if search_param:
            queryset = queryset.filter(
                Q(username__icontains=search_param)
                | Q(email__icontains=search_param)
                | Q(first_name__icontains=search_param)
                | Q(last_name__icontains=search_param)
            )

        return queryset


class UserAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserAdminSerializer
    permission_classes = (permissions.IsAuthenticated, IsAdminRole)

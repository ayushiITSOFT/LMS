from rest_framework import generics, permissions

from .models import Order
from .serializers import OrderSerializer
from accounts.permissions import is_admin, is_student


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        if is_admin(user):
            return Order.objects.all().select_related("student").prefetch_related("items__course").order_by("-created_at")
        if is_student(user):
            return Order.objects.filter(student=user).prefetch_related("items__course").order_by("-created_at")
        return Order.objects.none()

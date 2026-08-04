from rest_framework import generics, permissions

from .models import Order
from .serializers import OrderSerializer
from accounts.permissions import is_student


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if not is_student(self.request.user):
            return Order.objects.none()
        return Order.objects.filter(student=self.request.user).prefetch_related("items__course")

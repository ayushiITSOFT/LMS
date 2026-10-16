from decimal import Decimal

from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from cart.models import CartItem
from accounts.permissions import is_student
from security.throttles import UserWriteRateThrottle


class CheckoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    throttle_classes = (UserWriteRateThrottle,)

    def post(self, request):
        if not is_student(request.user):
            return Response(
                {"detail": "Only students can checkout."},
                status=status.HTTP_403_FORBIDDEN,
            )

        cart_items = CartItem.objects.filter(student=request.user).select_related("course")
        total = sum((item.course.price or Decimal("0")) for item in cart_items)

        return Response(
            {
                "message": "Checkout session created",
                "total_amount": float(total),
                "currency": "INR",
                "course_count": cart_items.count(),
            },
            status=status.HTTP_200_OK,
        )

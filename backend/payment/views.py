from decimal import Decimal

from django.db import transaction
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from cart.models import CartItem
from accounts.permissions import is_student
from security.throttles import UserWriteRateThrottle
from .models import Order, Payment
from .serializers import PaymentProcessResponseSerializer


class PaymentProcessView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    throttle_classes = (UserWriteRateThrottle,)

    def post(self, request):
        if not is_student(request.user):
            return Response(
                {"detail": "Only students can process payments."},
                status=status.HTTP_403_FORBIDDEN,
            )

        cart_items = CartItem.objects.filter(student=request.user).select_related("course")
        if not cart_items.exists():
            return Response(
                {"detail": "Your cart is empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        total_amount = sum((item.course.price or Decimal("0")) for item in cart_items)

        with transaction.atomic():
            if total_amount > Decimal("0"):
                order = Order.objects.create(
                    student=request.user,
                    total_amount=total_amount,
                    status=Order.Status.PENDING,
                )
                payment = Payment.objects.create(
                    order=order,
                    student=request.user,
                    amount=total_amount,
                    status=Payment.Status.PENDING,
                )

                order.status = Order.Status.COMPLETED
                order.save(update_fields=("status", "updated_at"))

                payment.status = Payment.Status.COMPLETED
                payment.save(update_fields=("status", "updated_at"))

                payload = {
                    "message": "Payment created successfully",
                    "order_id": order.id,
                    "payment_id": payment.id,
                    "total_amount": total_amount,
                    "currency": "USD",
                    "status": order.status,
                    "payment_status": payment.status,
                    "transaction_id": payment.transaction_id,
                }
            else:
                order = Order.objects.create(
                    student=request.user,
                    total_amount=Decimal("0.00"),
                    status=Order.Status.COMPLETED,
                )
                payload = {
                    "message": "Free order created successfully",
                    "order_id": order.id,
                    "total_amount": Decimal("0.00"),
                    "currency": "USD",
                    "status": order.status,
                }

        serializer = PaymentProcessResponseSerializer(payload)
        return Response(serializer.data, status=status.HTTP_200_OK)

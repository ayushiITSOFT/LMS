from decimal import Decimal

from django.db import transaction
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from cart.models import CartItem
from accounts.permissions import is_student
from security.throttles import UserWriteRateThrottle
from .serializers import PaymentProcessResponseSerializer
from orders.models import Order, OrderItem
from .models import Payment
from enrollment.models import Enrollment


class PaymentProcessView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    throttle_classes = (UserWriteRateThrottle,)

    def post(self, request):
        if not is_student(request.user):
            return Response(
                {"detail": "Only students can process payments."},
                status=status.HTTP_403_FORBIDDEN,
            )

        with transaction.atomic():
            cart_items = list(
                CartItem.objects.select_for_update()
                .filter(student=request.user)
                .select_related("course")
            )
            if not cart_items:
                return Response(
                    {"detail": "Your cart is empty."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            total_amount = sum((item.course.price or Decimal("0")) for item in cart_items)

            order = Order.objects.create(
                student=request.user,
                total_amount=total_amount,
                status=Order.Status.PENDING,
            )
            OrderItem.objects.bulk_create(
                [
                    OrderItem(
                        order=order,
                        course=item.course,
                        price=item.course.price or Decimal("0.00"),
                    )
                    for item in cart_items
                ]
            )

            if total_amount > Decimal("0"):
                payment = Payment.objects.create(
                    order=order,
                    student=request.user,
                    amount=total_amount,
                    status=Payment.Status.PENDING,
                )

                payment.status = Payment.Status.COMPLETED
                payment.save(update_fields=("status", "updated_at"))

                order.status = Order.Status.PAID
                order.save(update_fields=("status", "updated_at"))

                payload = {
                    "message": "Payment created successfully",
                    "order_id": order.id,
                    "payment_id": payment.id,
                    "total_amount": total_amount,
                    "currency": "INR",
                    "status": order.status,
                    "payment_status": payment.status,
                    "transaction_id": payment.transaction_id,
                }
            else:
                order.status = Order.Status.PAID
                order.save(update_fields=("status", "updated_at"))
                payload = {
                    "message": "Free order created successfully",
                    "order_id": order.id,
                    "total_amount": Decimal("0.00"),
                    "currency": "INR",
                    "status": order.status,
                }

            Enrollment.objects.bulk_create(
                [
                    Enrollment(student=request.user, course=item.course, order=order)
                    for item in cart_items
                ],
                ignore_conflicts=True,
            )

            CartItem.objects.filter(student=request.user).delete()

        serializer = PaymentProcessResponseSerializer(payload)
        return Response(serializer.data, status=status.HTTP_200_OK)

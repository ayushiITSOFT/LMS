from rest_framework import serializers

from .models import Order, Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ("id", "order", "amount", "status", "transaction_id", "created_at")
        read_only_fields = ("id", "order", "amount", "status", "transaction_id", "created_at")


class PaymentProcessResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    order_id = serializers.IntegerField(required=False)
    payment_id = serializers.IntegerField(required=False)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    currency = serializers.CharField()
    status = serializers.CharField()
    payment_status = serializers.CharField(required=False)
    transaction_id = serializers.CharField(required=False, allow_blank=True)

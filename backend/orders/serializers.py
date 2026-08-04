from rest_framework import serializers

from courses.models import Course
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    course_title = serializers.ReadOnlyField(source="course.title")

    class Meta:
        model = OrderItem
        fields = ("id", "course", "course_title", "price", "created_at")
        read_only_fields = fields


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ("id", "status", "total_amount", "items", "created_at", "updated_at")
        read_only_fields = fields

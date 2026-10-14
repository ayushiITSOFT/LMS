from rest_framework import serializers

from courses.models import Course
from .models import CartItem


class CartCourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ("id", "title", "category", "price", "thumbnail", "status")
        read_only_fields = fields


class CartItemSerializer(serializers.ModelSerializer):
    course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all())
    course_details = CartCourseSerializer(source="course", read_only=True)

    class Meta:
        model = CartItem
        fields = ("id", "course", "course_details", "created_at")
        read_only_fields = ("id", "created_at")

    def validate_course(self, value):
        request = self.context.get("request")
        if not request or not getattr(request, "user", None):
            return value

        if request.user == value.instructor:
            raise serializers.ValidationError("You cannot add your own course to the cart.")

        existing = CartItem.objects.filter(student=request.user, course=value).exists()
        if existing:
            raise serializers.ValidationError("This course is already in your cart.")

        from enrollment.models import Enrollment
        if Enrollment.objects.filter(student=request.user, course=value).exists():
            raise serializers.ValidationError("You are already enrolled in this course.")

        return value

    def create(self, validated_data):
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            validated_data["student"] = request.user
        return super().create(validated_data)

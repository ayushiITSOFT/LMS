from rest_framework import serializers

from courses.models import Course
from .models import Wishlist


class WishlistSerializer(serializers.ModelSerializer):
    course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all())

    class Meta:
        model = Wishlist
        fields = ("id", "course", "created_at")
        read_only_fields = ("id", "created_at")

    def create(self, validated_data):
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            validated_data["student"] = request.user
        return super().create(validated_data)

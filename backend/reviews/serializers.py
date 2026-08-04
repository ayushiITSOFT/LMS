from rest_framework import serializers

from .models import CourseReview


class CourseReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseReview
        fields = (
            "id",
            "course",
            "enrollment",
            "student",
            "rating",
            "title",
            "comment",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "student", "course", "enrollment", "created_at", "updated_at")

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

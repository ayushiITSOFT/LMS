from rest_framework import serializers

from .models import CourseAnnouncement


class CourseAnnouncementSerializer(serializers.ModelSerializer):
    course = serializers.ReadOnlyField(source="course.id")
    created_by = serializers.ReadOnlyField(source="created_by.id")
    created_by_name = serializers.ReadOnlyField(source="created_by.username")

    class Meta:
        model = CourseAnnouncement
        fields = (
            "id",
            "course",
            "created_by",
            "created_by_name",
            "title",
            "message",
            "is_pinned",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "course", "created_by", "created_by_name", "created_at", "updated_at")

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Title is required.")
        return value

    def validate_message(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Message is required.")
        return value

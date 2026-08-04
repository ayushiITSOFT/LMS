from rest_framework import serializers

from courses.models import Lesson
from .models import Assignment, AssignmentSubmission


class AssignmentSerializer(serializers.ModelSerializer):
    course = serializers.ReadOnlyField(source="course.id")
    lesson = serializers.PrimaryKeyRelatedField(queryset=Lesson.objects.all(), required=False, allow_null=True)

    class Meta:
        model = Assignment
        fields = (
            "id",
            "course",
            "lesson",
            "title",
            "description",
            "instructions",
            "due_date",
            "max_score",
            "status",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "course", "created_at", "updated_at")

    def create(self, validated_data):
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            course_id = self.context.get("course_id")
            if course_id:
                from courses.models import Course

                course = Course.objects.get(pk=course_id)
                validated_data["course"] = course
        return super().create(validated_data)


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    assignment = serializers.ReadOnlyField(source="assignment.id")
    student = serializers.ReadOnlyField(source="student.id")

    class Meta:
        model = AssignmentSubmission
        fields = (
            "id",
            "assignment",
            "student",
            "content",
            "submitted_at",
            "score",
            "feedback",
            "status",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "assignment", "student", "created_at", "updated_at")

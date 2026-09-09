from rest_framework import serializers
from django.utils import timezone

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

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Title is required.")
        return value

    def validate_max_score(self, value):
        if value <= 0:
            raise serializers.ValidationError("Max score must be greater than 0.")
        return value

    def validate(self, attrs):
        course_id = self.context.get("course_id")
        lesson = attrs.get("lesson")
        if course_id and lesson and lesson.section.course_id != course_id:
            raise serializers.ValidationError({"lesson": "Lesson must belong to this course."})
        return attrs

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
        read_only_fields = (
            "id",
            "assignment",
            "student",
            "submitted_at",
            "score",
            "feedback",
            "status",
            "created_at",
            "updated_at",
        )

    def create(self, validated_data):
        validated_data["submitted_at"] = timezone.now()
        validated_data["status"] = AssignmentSubmission.Status.SUBMITTED
        return super().create(validated_data)

    def validate_content(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Submission content is required.")
        return value


class AssignmentGradeSerializer(serializers.ModelSerializer):
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
        read_only_fields = (
            "id",
            "assignment",
            "student",
            "content",
            "submitted_at",
            "status",
            "created_at",
            "updated_at",
        )

    def validate_score(self, value):
        if value < 0:
            raise serializers.ValidationError("Score cannot be negative.")
        assignment = getattr(self.instance, "assignment", None)
        if assignment and value > assignment.max_score:
            raise serializers.ValidationError("Score cannot exceed assignment max score.")
        return value

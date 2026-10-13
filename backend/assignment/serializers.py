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
            "attachment_type",
            "pdf_file",
            "video_url",
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
    student_name = serializers.ReadOnlyField(source="student.username")
    student_email = serializers.ReadOnlyField(source="student.email")

    class Meta:
        model = AssignmentSubmission
        fields = (
            "id",
            "assignment",
            "student",
            "student_name",
            "student_email",
            "content",
            "file",
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
            "student_name",
            "student_email",
            "submitted_at",
            "score",
            "feedback",
            "created_at",
            "updated_at",
        )

    def validate(self, attrs):
        content = attrs.get("content", getattr(self.instance, "content", "")) or ""
        file = attrs.get("file", getattr(self.instance, "file", None))
        if not content.strip() and not file:
            raise serializers.ValidationError({"detail": "Please provide submission text content or upload a deliverable file."})
        return attrs

    def create(self, validated_data):
        status = validated_data.get("status", AssignmentSubmission.Status.SUBMITTED)
        if status == AssignmentSubmission.Status.SUBMITTED and "submitted_at" not in validated_data:
            validated_data["submitted_at"] = timezone.now()
        return super().create(validated_data)


class AssignmentGradeSerializer(serializers.ModelSerializer):
    assignment = serializers.ReadOnlyField(source="assignment.id")
    student = serializers.ReadOnlyField(source="student.id")
    student_name = serializers.ReadOnlyField(source="student.username")
    student_email = serializers.ReadOnlyField(source="student.email")

    class Meta:
        model = AssignmentSubmission
        fields = (
            "id",
            "assignment",
            "student",
            "student_name",
            "student_email",
            "content",
            "file",
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
            "file",
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

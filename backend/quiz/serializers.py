from rest_framework import serializers

from courses.models import Lesson
from .models import Quiz, QuizOption, QuizQuestion, QuizAttempt


class QuizOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizOption
        fields = ("id", "text", "is_correct", "order", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_text(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Text is required.")
        return value


class QuizOptionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizOption
        fields = ("id", "text", "is_correct", "order", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_text(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Text is required.")
        return value


class QuizQuestionSerializer(serializers.ModelSerializer):
    options = QuizOptionSerializer(many=True, read_only=True)

    class Meta:
        model = QuizQuestion
        fields = ("id", "text", "question_type", "order", "options", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_text(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Text is required.")
        return value


class QuizQuestionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = ("id", "text", "question_type", "order", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_text(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Text is required.")
        return value


class QuizSerializer(serializers.ModelSerializer):
    course = serializers.ReadOnlyField(source="course.id")
    lesson = serializers.PrimaryKeyRelatedField(queryset=Lesson.objects.all(), required=False, allow_null=True)

    class Meta:
        model = Quiz
        fields = ("id", "course", "lesson", "title", "description", "status", "created_at", "updated_at")
        read_only_fields = ("id", "course", "created_at", "updated_at")

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Title is required.")
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


class QuizDetailSerializer(serializers.ModelSerializer):
    questions = QuizQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ("id", "title", "description", "status", "questions", "created_at", "updated_at")
        read_only_fields = fields


class QuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = ("id", "quiz", "student", "status", "score", "created_at", "updated_at")
        read_only_fields = ("id", "student", "quiz", "created_at", "updated_at")

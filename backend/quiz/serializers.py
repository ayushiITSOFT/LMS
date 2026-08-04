from rest_framework import serializers

from courses.models import Lesson
from .models import Quiz, QuizOption, QuizQuestion, QuizAttempt


class QuizOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizOption
        fields = ("id", "text", "is_correct", "order", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")


class QuizOptionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizOption
        fields = ("id", "text", "is_correct", "order", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")


class QuizQuestionSerializer(serializers.ModelSerializer):
    options = QuizOptionSerializer(many=True, read_only=True)

    class Meta:
        model = QuizQuestion
        fields = ("id", "text", "question_type", "order", "options", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")


class QuizQuestionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = ("id", "text", "question_type", "order", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")


class QuizSerializer(serializers.ModelSerializer):
    course = serializers.ReadOnlyField(source="course.id")
    lesson = serializers.PrimaryKeyRelatedField(queryset=Lesson.objects.all(), required=False, allow_null=True)

    class Meta:
        model = Quiz
        fields = ("id", "course", "lesson", "title", "description", "status", "created_at", "updated_at")
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

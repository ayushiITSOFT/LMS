from rest_framework import serializers

from courses.models import Lesson
from .models import Quiz, QuizAnswer, QuizAttempt, QuizOption, QuizQuestion

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
    options = QuizOptionCreateSerializer(many=True, required=False)

    class Meta:
        model = QuizQuestion
        fields = ("id", "text", "question_type", "order", "options", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_text(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Text is required.")
        return value

    def create(self, validated_data):
        options_data = validated_data.pop("options", [])
        question = QuizQuestion.objects.create(**validated_data)
        for opt in options_data:
            QuizOption.objects.create(question=question, **opt)
        return question


class QuizSerializer(serializers.ModelSerializer):
    course = serializers.ReadOnlyField(source="course.id")
    lesson = serializers.PrimaryKeyRelatedField(queryset=Lesson.objects.all(), required=False, allow_null=True)
    question_count = serializers.SerializerMethodField(read_only=True)
    questions = QuizQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ("id", "course", "lesson", "title", "description", "status", "question_count", "questions", "created_at", "updated_at")
        read_only_fields = ("id", "course", "created_at", "updated_at")

    def get_question_count(self, obj):
        return obj.questions.count()

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
        course_id = self.context.get("course_id")    
        if course_id:
            from courses.models import Course

            course = Course.objects.get(pk=course_id)
            validated_data["course"] = course
        return super().create(validated_data)


class QuizDetailSerializer(serializers.ModelSerializer):
    questions = QuizQuestionSerializer(many=True, read_only=True)
    question_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Quiz
        fields = ("id", "title", "description", "status", "question_count", "questions", "created_at", "updated_at")
        read_only_fields = fields

    def get_question_count(self, obj):
        return obj.questions.count()


class QuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = ("id", "quiz", "student", "status", "score", "created_at", "updated_at")
        read_only_fields = ("id", "quiz", "student", "status", "score", "created_at", "updated_at")

class QuizAnswerSerializer(serializers.ModelSerializer):
    selected_options = serializers.PrimaryKeyRelatedField(
        queryset=QuizOption.objects.all(),
        many=True,
        required=False,
    )
    selected_option = serializers.PrimaryKeyRelatedField(
        queryset=QuizOption.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = QuizAnswer
        fields = (
            "id",
            "attempt",
            "question",
            "selected_options",
            "selected_option",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "attempt",
            "question",
            "created_at",
            "updated_at",
        )
        

from django.conf import settings
from django.db import models

from courses.models import Course, Lesson


class Quiz(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"

    course = models.ForeignKey(Course, related_name="quizzes", on_delete=models.CASCADE)
    lesson = models.OneToOneField(Lesson, related_name="quiz", on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("created_at",)

    def __str__(self):
        return self.title


class QuizQuestion(models.Model):
    class Type(models.TextChoices):
        SINGLE_CHOICE = "single_choice", "Single Choice"
        MULTIPLE_CHOICE = "multiple_choice", "Multiple Choice"
        TRUE_FALSE = "true_false", "True/False"

    quiz = models.ForeignKey(Quiz, related_name="questions", on_delete=models.CASCADE)
    text = models.TextField()
    question_type = models.CharField(max_length=20, choices=Type.choices, default=Type.SINGLE_CHOICE)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("order", "created_at")

    def __str__(self):
        return self.text


class QuizOption(models.Model):
    question = models.ForeignKey(QuizQuestion, related_name="options", on_delete=models.CASCADE)
    text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("order", "created_at")

    def __str__(self):
        return self.text


class QuizAttempt(models.Model):
    class Status(models.TextChoices):
        IN_PROGRESS = "in_progress", "In Progress"
        SUBMITTED = "submitted", "Submitted"

    quiz = models.ForeignKey(Quiz, related_name="attempts", on_delete=models.CASCADE)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="quiz_attempts", on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.IN_PROGRESS)
    score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.student} -> {self.quiz}"

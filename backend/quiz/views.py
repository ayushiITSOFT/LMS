from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions

from courses.models import Course
from accounts.permissions import CanManageOwnCourse
from .models import Quiz, QuizAttempt, QuizOption, QuizQuestion
from .serializers import (
    QuizAttemptSerializer,
    QuizDetailSerializer,
    QuizOptionCreateSerializer,
    QuizOptionSerializer,
    QuizQuestionCreateSerializer,
    QuizQuestionSerializer,
    QuizSerializer,
)


class QuizListCreateView(generics.ListCreateAPIView):
    serializer_class = QuizSerializer
    permission_classes = (permissions.IsAuthenticated, CanManageOwnCourse)

    def get_queryset(self):
        course = get_object_or_404(Course, pk=self.kwargs.get("course_pk"))
        self.check_object_permissions(self.request, course)
        return Quiz.objects.filter(course=course)

    def perform_create(self, serializer):
        course = get_object_or_404(Course, pk=self.kwargs.get("course_pk"))
        self.check_object_permissions(self.request, course)
        serializer.context["course_id"] = course.id
        serializer.save()


class QuizDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = QuizDetailSerializer
    permission_classes = (permissions.IsAuthenticated, CanManageOwnCourse)

    def get_queryset(self):
        course = get_object_or_404(Course, pk=self.kwargs.get("course_pk"))
        self.check_object_permissions(self.request, course)
        return Quiz.objects.filter(course=course)


class QuizQuestionListCreateView(generics.ListCreateAPIView):
    serializer_class = QuizQuestionSerializer
    permission_classes = (permissions.IsAuthenticated, CanManageOwnCourse)

    def get_queryset(self):
        quiz = get_object_or_404(Quiz, pk=self.kwargs.get("quiz_pk"), course_id=self.kwargs.get("course_pk"))
        self.check_object_permissions(self.request, quiz.course)
        return QuizQuestion.objects.filter(quiz=quiz)

    def perform_create(self, serializer):
        quiz = get_object_or_404(Quiz, pk=self.kwargs.get("quiz_pk"), course_id=self.kwargs.get("course_pk"))
        self.check_object_permissions(self.request, quiz.course)
        serializer.save(quiz=quiz)


class QuizOptionListCreateView(generics.ListCreateAPIView):
    serializer_class = QuizOptionSerializer
    permission_classes = (permissions.IsAuthenticated, CanManageOwnCourse)

    def get_queryset(self):
        quiz = get_object_or_404(Quiz, pk=self.kwargs.get("quiz_pk"), course_id=self.kwargs.get("course_pk"))
        self.check_object_permissions(self.request, quiz.course)
        return QuizOption.objects.filter(question__quiz=quiz)

    def perform_create(self, serializer):
        quiz = get_object_or_404(Quiz, pk=self.kwargs.get("quiz_pk"), course_id=self.kwargs.get("course_pk"))
        self.check_object_permissions(self.request, quiz.course)
        question = get_object_or_404(QuizQuestion, pk=self.kwargs.get("question_pk"), quiz=quiz)
        serializer.save(question=question)


class QuizAttemptListCreateView(generics.ListCreateAPIView):
    serializer_class = QuizAttemptSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        quiz = get_object_or_404(Quiz, pk=self.kwargs.get("quiz_pk"), course_id=self.kwargs.get("course_pk"))
        return QuizAttempt.objects.filter(quiz=quiz, student=self.request.user)

    def perform_create(self, serializer):
        quiz = get_object_or_404(Quiz, pk=self.kwargs.get("quiz_pk"), course_id=self.kwargs.get("course_pk"))
        serializer.save(student=self.request.user, quiz=quiz)


class QuizAttemptDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = QuizAttemptSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return QuizAttempt.objects.filter(student=self.request.user)

from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from django.db import transaction

from courses.models import Course
from accounts.permissions import CanManageOwnCourse
from enrollment.models import Enrollment

from audit_logs.models import AuditLog
from audit_logs.services import log_admin_action, snapshot
from .models import Quiz, QuizAnswer, QuizAttempt, QuizOption, QuizQuestion
from .serializers import (
    QuizAnswerSerializer,
    QuizAttemptSerializer,
    QuizDetailSerializer,
    QuizOptionSerializer,
    QuizQuestionSerializer,
    QuizSerializer,
)


class QuizListCreateView(generics.ListCreateAPIView):
    serializer_class = QuizSerializer
    permission_classes = (permissions.IsAuthenticated, CanManageOwnCourse)

    def get_queryset(self):
        course = get_object_or_404(Course, pk=self.kwargs.get("course_pk"))
        self.check_object_permissions(self.request, course)
        return Quiz.objects.filter(course=course).select_related("course", "lesson")

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
        return Quiz.objects.filter(course=course).select_related("course", "lesson").prefetch_related("questions__options")

    def perform_update(self, serializer):
        previous = snapshot(self.get_object())
        instance = serializer.save()
        log_admin_action(self.request.user, AuditLog.Action.UPDATE, instance, previous, snapshot(instance))

    def perform_destroy(self, instance):
        previous = snapshot(instance)
        log_admin_action(self.request.user, AuditLog.Action.DELETE, instance, previous, None)
        instance.delete()


class QuizQuestionListCreateView(generics.ListCreateAPIView):
    serializer_class = QuizQuestionSerializer
    permission_classes = (permissions.IsAuthenticated, CanManageOwnCourse)

    def get_queryset(self):
        quiz = get_object_or_404(Quiz.objects.select_related("course"), pk=self.kwargs.get("quiz_pk"), course_id=self.kwargs.get("course_pk"))
        self.check_object_permissions(self.request, quiz.course)
        return QuizQuestion.objects.filter(quiz=quiz).select_related("quiz").prefetch_related("options")

    def perform_create(self, serializer):
        quiz = get_object_or_404(Quiz.objects.select_related("course"), pk=self.kwargs.get("quiz_pk"), course_id=self.kwargs.get("course_pk"))
        self.check_object_permissions(self.request, quiz.course)
        serializer.save(quiz=quiz)


class QuizOptionListCreateView(generics.ListCreateAPIView):
    serializer_class = QuizOptionSerializer
    permission_classes = (permissions.IsAuthenticated, CanManageOwnCourse)

    def get_queryset(self):
        quiz = get_object_or_404(Quiz.objects.select_related("course"), pk=self.kwargs.get("quiz_pk"), course_id=self.kwargs.get("course_pk"))
        self.check_object_permissions(self.request, quiz.course)
        return QuizOption.objects.filter(question__quiz=quiz).select_related("question__quiz")

    def perform_create(self, serializer):
        quiz = get_object_or_404(Quiz.objects.select_related("course"), pk=self.kwargs.get("quiz_pk"), course_id=self.kwargs.get("course_pk"))
        self.check_object_permissions(self.request, quiz.course)
        question = get_object_or_404(QuizQuestion.objects.select_related("quiz"), pk=self.kwargs.get("question_pk"), quiz=quiz)
        serializer.save(question=question)


class QuizAttemptListCreateView(generics.ListCreateAPIView):
    serializer_class = QuizAttemptSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        quiz = get_object_or_404(Quiz.objects.select_related("course"), pk=self.kwargs.get("quiz_pk"), course_id=self.kwargs.get("course_pk"))
        return QuizAttempt.objects.filter(quiz=quiz, student=self.request.user).select_related("quiz__course", "student")

    def perform_create(self, serializer):
        quiz = get_object_or_404(Quiz.objects.select_related("course"), pk=self.kwargs.get("quiz_pk"), course_id=self.kwargs.get("course_pk"))
        serializer.save(student=self.request.user, quiz=quiz)


class QuizAttemptDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = QuizAttemptSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return QuizAttempt.objects.filter(
            student=self.request.user
        ).select_related(
            "quiz__course",
            "student",
        )

    def perform_update(self, serializer):
        previous = snapshot(self.get_object())
        instance = serializer.save()

        log_admin_action(
            self.request.user,
            AuditLog.Action.UPDATE,
            instance,
            previous,
            snapshot(instance),
        )

    def perform_destroy(self, instance):
        previous = snapshot(instance)

        log_admin_action(
            self.request.user,
            AuditLog.Action.DELETE,
            instance,
            previous,
            None,
        )

        instance.delete()
        
class QuizAnswerCreateView(generics.CreateAPIView):
    serializer_class = QuizAnswerSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def perform_create(self, serializer):
        attempt = get_object_or_404(
            QuizAttempt.objects.select_related("quiz__course"),
            pk=self.kwargs.get("attempt_pk"),
            student=self.request.user,
        )

        if attempt.status != QuizAttempt.Status.IN_PROGRESS:
            raise PermissionDenied(
                "This quiz attempt has already been submitted."
            )

        question = get_object_or_404(
            QuizQuestion.objects.filter(quiz=attempt.quiz),
            pk=self.kwargs.get("question_pk"),
        )

        serializer.save(
            attempt=attempt,
            question=question,
        )
        
class QuizAttemptSubmitView(generics.UpdateAPIView):
    serializer_class = QuizAttemptSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return QuizAttempt.objects.filter(
            student=self.request.user
        ).select_related(
            "quiz__course",
            "student",
        )

    @transaction.atomic
    def perform_update(self, serializer):
        attempt = self.get_object()

        if attempt.status != QuizAttempt.Status.IN_PROGRESS:
            raise PermissionDenied(
                "This quiz attempt has already been submitted."
            )

        questions = QuizQuestion.objects.filter(
            quiz=attempt.quiz
        ).prefetch_related("options")

        answers = {
            answer.question_id: set(
                answer.selected_options.values_list("id", flat=True)
            )
            for answer in attempt.answers.prefetch_related("selected_options")
        }

        total_questions = questions.count()

        if total_questions == 0:
            score = 0
        else:
            correct_count = 0

            for question in questions:
                selected = answers.get(question.id, set())

                correct = set(
                    question.options.filter(
                        is_correct=True
                    ).values_list("id", flat=True)
                )

                if selected == correct:
                    correct_count += 1

            score = (correct_count / total_questions) * 100

        instance = serializer.save(
            status=QuizAttempt.Status.SUBMITTED,
            score=score,
        )

        return instance
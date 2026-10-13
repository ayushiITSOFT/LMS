from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
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
    QuizQuestionCreateSerializer,
    QuizSerializer,
)


class QuizListCreateView(generics.ListCreateAPIView):
    serializer_class = QuizSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), CanManageOwnCourse()]

    def get_queryset(self):
        course = get_object_or_404(Course, pk=self.kwargs.get("course_pk"))
        return Quiz.objects.filter(course=course).select_related("course", "lesson")

    def perform_create(self, serializer):
        course = get_object_or_404(Course, pk=self.kwargs.get("course_pk"))
        self.check_object_permissions(self.request, course)
        serializer.context["course_id"] = course.id
        serializer.save()


class QuizDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = QuizDetailSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), CanManageOwnCourse()]

    def get_queryset(self):
        course = get_object_or_404(Course, pk=self.kwargs.get("course_pk"))
        return Quiz.objects.filter(course=course).select_related("course", "lesson").prefetch_related("questions__options")

    def perform_update(self, serializer):
        quiz = self.get_object()
        self.check_object_permissions(self.request, quiz.course)
        previous = snapshot(quiz)
        instance = serializer.save()
        log_admin_action(self.request.user, AuditLog.Action.UPDATE, instance, previous, snapshot(instance))

    def perform_destroy(self, instance):
        self.check_object_permissions(self.request, instance.course)
        previous = snapshot(instance)
        log_admin_action(self.request.user, AuditLog.Action.DELETE, instance, previous, None)
        instance.delete()


class QuizQuestionListCreateView(generics.ListCreateAPIView):
    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), CanManageOwnCourse()]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return QuizQuestionCreateSerializer
        return QuizQuestionSerializer

    def get_queryset(self):
        quiz = get_object_or_404(Quiz.objects.select_related("course"), pk=self.kwargs.get("quiz_pk"), course_id=self.kwargs.get("course_pk"))
        return QuizQuestion.objects.filter(quiz=quiz).select_related("quiz").prefetch_related("options")

    def perform_create(self, serializer):
        quiz = get_object_or_404(Quiz.objects.select_related("course"), pk=self.kwargs.get("quiz_pk"), course_id=self.kwargs.get("course_pk"))
        self.check_object_permissions(self.request, quiz.course)
        serializer.save(quiz=quiz)


class QuizQuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = QuizQuestionSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), CanManageOwnCourse()]

    def get_queryset(self):
        quiz = get_object_or_404(Quiz.objects.select_related("course"), pk=self.kwargs.get("quiz_pk"), course_id=self.kwargs.get("course_pk"))
        return QuizQuestion.objects.filter(quiz=quiz).select_related("quiz").prefetch_related("options")

    def perform_update(self, serializer):
        question = self.get_object()
        self.check_object_permissions(self.request, question.quiz.course)
        serializer.save()

    def perform_destroy(self, instance):
        self.check_object_permissions(self.request, instance.quiz.course)
        instance.delete()


class QuizOptionListCreateView(generics.ListCreateAPIView):
    serializer_class = QuizOptionSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), CanManageOwnCourse()]

    def get_queryset(self):
        quiz = get_object_or_404(Quiz.objects.select_related("course"), pk=self.kwargs.get("quiz_pk"), course_id=self.kwargs.get("course_pk"))
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

    def create(self, request, *args, **kwargs):
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

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        selected_options = list(serializer.validated_data.get("selected_options", []))
        single_option = serializer.validated_data.get("selected_option")
        if single_option and single_option not in selected_options:
            selected_options.append(single_option)

        answer, created = QuizAnswer.objects.get_or_create(
            attempt=attempt,
            question=question,
        )
        answer.selected_options.set(selected_options)
        answer.save()

        return Response(
            QuizAnswerSerializer(answer).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

class QuizAttemptSubmitView(generics.GenericAPIView):
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
    def post(self, request, *args, **kwargs):
        attempt = get_object_or_404(
            self.get_queryset(),
            pk=self.kwargs.get("pk"),
            quiz_id=self.kwargs.get("quiz_pk"),
            quiz__course_id=self.kwargs.get("course_pk"),
        )

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

                if selected and selected == correct:
                    correct_count += 1

            score = round((correct_count / total_questions) * 100, 2)

        attempt.status = QuizAttempt.Status.SUBMITTED
        attempt.score = score
        attempt.save()

        # Automatically record lesson progress as completed upon submitting quiz attempt
        try:
            from enrollment.models import Enrollment, CourseProgress
            enrollment = Enrollment.objects.filter(student=attempt.student, course=attempt.quiz.course).first()
            if enrollment:
                target_lesson = attempt.quiz.lesson
                if not target_lesson:
                    from courses.models import Lesson
                    target_lesson = Lesson.objects.filter(section__course=attempt.quiz.course).first()
                if target_lesson:
                    progress, _ = CourseProgress.objects.get_or_create(enrollment=enrollment, lesson=target_lesson)
                    progress.mark_completed()
        except Exception:
            pass

        serializer = self.get_serializer(attempt)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, *args, **kwargs):
        return self.post(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        return self.post(request, *args, **kwargs)
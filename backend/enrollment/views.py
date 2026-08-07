from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Prefetch
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from assignment.models import Assignment, AssignmentSubmission
from certificate.models import Certificate
from courses.models import Lesson, Section
from quiz.models import QuizAttempt
from .models import Enrollment, CourseProgress
from .serializers import (
    EnrollmentSerializer,
    MyCourseDetailSerializer,
    MyCourseSummarySerializer,
    StudentDashboardSerializer,
)
from accounts.permissions import is_student


class EnrollmentListView(generics.ListAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if not is_student(self.request.user):
            return Enrollment.objects.none()
        return Enrollment.objects.filter(student=self.request.user).select_related("course", "order")


class MyCourseListView(generics.ListAPIView):
    serializer_class = MyCourseSummarySerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if not is_student(self.request.user):
            return Enrollment.objects.none()
        return (
            Enrollment.objects.filter(student=self.request.user)
            .select_related("course")
            .prefetch_related("progress", "course__sections__lessons")
        )


class MyCourseDetailView(generics.RetrieveAPIView):
    serializer_class = MyCourseDetailSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        if not is_student(self.request.user):
            raise PermissionDenied("Only students can view their courses.")
        return get_object_or_404(
            Enrollment.objects.filter(student=self.request.user)
            .select_related("course")
            .prefetch_related(
                Prefetch("course__sections", queryset=Section.objects.prefetch_related("lessons")),
                "progress__lesson__section",
            ),
            course_id=self.kwargs.get("course_pk"),
        )


class MyCourseResumeView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, course_pk):
        if not is_student(request.user):
            return Response({"detail": "Only students can view course progress."}, status=status.HTTP_403_FORBIDDEN)

        enrollment = get_object_or_404(
            Enrollment.objects.filter(student=request.user).select_related("course"),
            course_id=course_pk,
        )
        lessons = Lesson.objects.filter(section__course=enrollment.course).select_related("section").order_by("section__order", "order")
        for lesson in lessons:
            if not CourseProgress.objects.filter(enrollment=enrollment, lesson=lesson, completed=True).exists():
                return Response(
                    {
                        "course_id": enrollment.course.id,
                        "course_title": enrollment.course.title,
                        "lesson": {
                            "id": lesson.id,
                            "title": lesson.title,
                            "kind": lesson.kind,
                            "section_title": lesson.section.title,
                        },
                    },
                    status=status.HTTP_200_OK,
                )
        return Response({"detail": "No lesson remaining."}, status=status.HTTP_200_OK)


class StudentDashboardView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        if not is_student(request.user):
            return Response({"detail": "Only students can access the dashboard."}, status=status.HTTP_403_FORBIDDEN)

        user = request.user
        enrollments = list(
            Enrollment.objects.filter(student=user)
            .select_related("course")
            .prefetch_related("progress", "course__sections__lessons")
        )
        total_enrolled = len(enrollments)
        completed_courses = sum(1 for enrollment in enrollments if enrollment.is_course_completed())
        courses_in_progress = total_enrolled - completed_courses

        certificates_count = Certificate.objects.filter(student=user).count()

        now = timezone.now()
        course_ids = [enrollment.course_id for enrollment in enrollments]
        assignment_qs = Assignment.objects.filter(course_id__in=course_ids, status=Assignment.Status.PUBLISHED, due_date__gte=now)
        submitted_assignment_ids = AssignmentSubmission.objects.filter(
            student=user,
            assignment_id__in=assignment_qs.values_list("id", flat=True),
            status__in=(AssignmentSubmission.Status.SUBMITTED, AssignmentSubmission.Status.GRADED),
        ).values_list("assignment_id", flat=True)
        pending_assignments_qs = assignment_qs.exclude(id__in=submitted_assignment_ids)
        pending_assignments = pending_assignments_qs.count()

        upcoming_deadlines_qs = pending_assignments_qs.select_related("course").order_by("due_date")[:5]
        upcoming_deadlines = [
            {
                "assignment_id": assignment.id,
                "title": assignment.title,
                "course_id": assignment.course.id,
                "course_title": assignment.course.title,
                "due_date": assignment.due_date,
                "status": assignment.status,
            }
            for assignment in upcoming_deadlines_qs
        ]

        recent_activity = []
        lesson_progress_events = CourseProgress.objects.filter(
            enrollment__student=user,
            completed=True,
            completed_at__isnull=False,
        ).select_related("enrollment__course", "lesson__section").order_by("-completed_at")[:10]
        for progress in lesson_progress_events:
            recent_activity.append(
                {
                    "type": "lesson_completed",
                    "message": f"Completed lesson '{progress.lesson.title}' in {progress.enrollment.course.title}",
                    "timestamp": progress.completed_at,
                    "details": {
                        "course_id": progress.enrollment.course.id,
                        "lesson_id": progress.lesson.id,
                    },
                }
            )

        recent_activity.extend(
            [
                {
                    "type": "certificate_earned",
                    "message": f"Earned certificate for {certificate.course.title}",
                    "timestamp": certificate.issued_at,
                    "details": {
                        "course_id": certificate.course.id,
                        "certificate_id": certificate.id,
                    },
                }
                for certificate in Certificate.objects.filter(student=user).select_related("course").order_by("-issued_at")[:10]
            ]
        )

        recent_activity.extend(
            [
                {
                    "type": "assignment_submission",
                    "message": f"Submitted assignment '{submission.assignment.title}' for {submission.assignment.course.title}",
                    "timestamp": submission.updated_at,
                    "details": {
                        "assignment_id": submission.assignment.id,
                        "status": submission.status,
                    },
                }
                for submission in AssignmentSubmission.objects.filter(student=user).select_related("assignment__course").order_by("-updated_at")[:10]
            ]
        )

        recent_activity.extend(
            [
                {
                    "type": "quiz_attempt",
                    "message": f"Quiz attempt scored {attempt.score} on {attempt.quiz.course.title}",
                    "timestamp": attempt.updated_at,
                    "details": {
                        "quiz_id": attempt.quiz.id,
                        "score": float(attempt.score),
                    },
                }
                for attempt in QuizAttempt.objects.filter(student=user).select_related("quiz__course").order_by("-updated_at")[:10]
            ]
        )

        recent_activity.sort(key=lambda item: item["timestamp"], reverse=True)
        recent_activity = recent_activity[:10]

        data = {
            "total_enrolled_courses": total_enrolled,
            "courses_in_progress": courses_in_progress,
            "completed_courses": completed_courses,
            "certificates_earned": certificates_count,
            "pending_assignments": pending_assignments,
            "upcoming_deadlines": upcoming_deadlines,
            "recent_activity": recent_activity,
        }

        serializer = StudentDashboardSerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)


class LessonCompleteView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, course_pk, lesson_pk):
        if not is_student(request.user):
            return Response({"detail": "Only students can update lesson progress."}, status=status.HTTP_403_FORBIDDEN)

        enrollment = get_object_or_404(
            Enrollment.objects.filter(student=request.user).select_related("course"),
            course_id=course_pk,
        )
        lesson = get_object_or_404(Lesson.objects.select_related("section"), pk=lesson_pk, section__course=enrollment.course)

        progress, created = CourseProgress.objects.get_or_create(enrollment=enrollment, lesson=lesson)
        progress.mark_completed()

        return Response(
            {
                "message": "Lesson marked as completed",
                "progress_percentage": enrollment.get_progress_percentage(),
                "course_completed": enrollment.is_course_completed(),
                "lesson": {
                    "id": lesson.id,
                    "title": lesson.title,
                    "kind": lesson.kind,
                    "section_title": lesson.section.title,
                },
            },
            status=status.HTTP_200_OK,
        )

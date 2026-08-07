from django.db.models import Avg, Count, Q, Sum
from django.db.models.functions import TruncDate
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdminRole
from assignment.models import Assignment, AssignmentSubmission
from courses.models import Course
from enrollment.models import CourseProgress, Enrollment
from orders.models import Order
from quiz.models import Quiz, QuizAttempt


class AdminAnalyticsView(APIView):
    permission_classes = (permissions.IsAuthenticated, IsAdminRole)


class CourseCompletionRateView(AdminAnalyticsView):
    def get(self, request):
        rows = []
        total_enrollments = 0
        completed_enrollments = 0

        for course in Course.objects.all().order_by("id"):
            enrollments = Enrollment.objects.filter(course=course)
            total = enrollments.count()
            completed = sum(1 for enrollment in enrollments if enrollment.is_course_completed())
            total_enrollments += total
            completed_enrollments += completed
            rows.append(
                {
                    "course_id": course.id,
                    "course_title": course.title,
                    "total_enrollments": total,
                    "completed_enrollments": completed,
                    "completion_rate": round((completed / total) * 100, 2) if total else 0,
                }
            )

        return Response(
            {
                "overall_completion_rate": round((completed_enrollments / total_enrollments) * 100, 2) if total_enrollments else 0,
                "courses": rows,
            }
        )


class EnrollmentTrendsView(AdminAnalyticsView):
    def get(self, request):
        trends = (
            Enrollment.objects.annotate(date=TruncDate("created_at"))
            .values("date")
            .annotate(enrollments=Count("id"))
            .order_by("date")
        )
        return Response({"trends": list(trends)})


class RevenueTrendsView(AdminAnalyticsView):
    def get(self, request):
        trends = (
            Order.objects.filter(status=Order.Status.PAID)
            .annotate(date=TruncDate("created_at"))
            .values("date")
            .annotate(revenue=Sum("total_amount"), orders=Count("id"))
            .order_by("date")
        )
        return Response({"trends": list(trends)})


class QuizPerformanceView(AdminAnalyticsView):
    def get(self, request):
        attempts = QuizAttempt.objects.filter(status=QuizAttempt.Status.SUBMITTED)
        by_quiz = (
            Quiz.objects.annotate(
                attempts=Count("attempts", filter=Q(attempts__status=QuizAttempt.Status.SUBMITTED)),
                average_score=Avg("attempts__score", filter=Q(attempts__status=QuizAttempt.Status.SUBMITTED)),
            )
            .values("id", "title", "course_id", "attempts", "average_score")
            .order_by("id")
        )
        return Response(
            {
                "total_attempts": attempts.count(),
                "average_score": round(attempts.aggregate(score=Avg("score"))["score"] or 0, 2),
                "quizzes": list(by_quiz),
            }
        )


class AssignmentPerformanceView(AdminAnalyticsView):
    def get(self, request):
        submissions = AssignmentSubmission.objects.filter(
            status__in=(AssignmentSubmission.Status.SUBMITTED, AssignmentSubmission.Status.GRADED)
        )
        by_assignment = (
            Assignment.objects.annotate(
                submissions=Count(
                    "submissions",
                    filter=Q(
                        submissions__status__in=(AssignmentSubmission.Status.SUBMITTED, AssignmentSubmission.Status.GRADED)
                    ),
                ),
                graded_submissions=Count("submissions", filter=Q(submissions__status=AssignmentSubmission.Status.GRADED)),
                average_score=Avg("submissions__score", filter=Q(submissions__status=AssignmentSubmission.Status.GRADED)),
            )
            .values("id", "title", "course_id", "submissions", "graded_submissions", "average_score")
            .order_by("id")
        )
        return Response(
            {
                "total_submissions": submissions.count(),
                "graded_submissions": submissions.filter(status=AssignmentSubmission.Status.GRADED).count(),
                "average_score": round(submissions.filter(status=AssignmentSubmission.Status.GRADED).aggregate(score=Avg("score"))["score"] or 0, 2),
                "assignments": list(by_assignment),
            }
        )


class StudentActivityView(AdminAnalyticsView):
    def get(self, request):
        return Response(
            {
                "total_enrollments": Enrollment.objects.count(),
                "completed_lessons": CourseProgress.objects.filter(completed=True).count(),
                "quiz_attempts": QuizAttempt.objects.count(),
                "assignment_submissions": AssignmentSubmission.objects.exclude(status=AssignmentSubmission.Status.DRAFT).count(),
                "recent_enrollments": list(
                    Enrollment.objects.select_related("student", "course").order_by("-created_at").values(
                        "id", "student_id", "student__username", "course_id", "course__title", "created_at"
                    )[:10]
                ),
                "recent_lesson_completions": list(
                    CourseProgress.objects.filter(completed=True)
                    .select_related("enrollment__student", "enrollment__course", "lesson")
                    .order_by("-completed_at")
                    .values(
                        "id",
                        "enrollment__student_id",
                        "enrollment__student__username",
                        "enrollment__course_id",
                        "enrollment__course__title",
                        "lesson_id",
                        "lesson__title",
                        "completed_at",
                    )[:10]
                ),
            }
        )

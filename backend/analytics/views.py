from django.db.models import Avg, Count, Q, Sum
from django.db.models.functions import TruncDate
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsInstructorRole, is_admin
from assignment.models import Assignment, AssignmentSubmission
from courses.models import Course
from enrollment.models import CourseProgress, Enrollment
from orders.models import Order, OrderItem
from quiz.models import Quiz, QuizAttempt


class AdminAnalyticsView(APIView):
    permission_classes = (permissions.IsAuthenticated, IsInstructorRole)

    def get_courses(self, request):
        courses = Course.objects.all()
        if not is_admin(request.user):
            courses = courses.filter(instructor=request.user)
        return courses


class CourseCompletionRateView(AdminAnalyticsView):
    def get(self, request):
        rows = []
        total_enrollments = 0
        completed_enrollments = 0

        for course in self.get_courses(request).order_by("id"):
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
        enrollments = Enrollment.objects.all()
        if not is_admin(request.user):
            enrollments = enrollments.filter(course__instructor=request.user)
        trends = (
            enrollments.annotate(date=TruncDate("created_at"))
            .values("date")
            .annotate(enrollments=Count("id"))
            .order_by("date")
        )
        return Response({"trends": list(trends)})


class RevenueTrendsView(AdminAnalyticsView):
    def get(self, request):
        if is_admin(request.user):
            trends = (
                Order.objects.filter(status=Order.Status.PAID)
                .annotate(date=TruncDate("created_at"))
                .values("date")
                .annotate(revenue=Sum("total_amount"), orders=Count("id"))
                .order_by("date")
            )
        else:
            trends = (
                OrderItem.objects.filter(order__status=Order.Status.PAID, course__instructor=request.user)
                .annotate(date=TruncDate("order__created_at"))
                .values("date")
                .annotate(revenue=Sum("price"), orders=Count("order_id", distinct=True))
                .order_by("date")
            )
        return Response({"trends": list(trends)})


class QuizPerformanceView(AdminAnalyticsView):
    def get(self, request):
        attempts = QuizAttempt.objects.filter(status=QuizAttempt.Status.SUBMITTED)
        quizzes = Quiz.objects.all()
        if not is_admin(request.user):
            quizzes = quizzes.filter(course__instructor=request.user)
            attempts = attempts.filter(quiz__course__instructor=request.user)
        quiz_rows = (
            quizzes.annotate(
                submitted_attempt_count=Count("attempts", filter=Q(attempts__status=QuizAttempt.Status.SUBMITTED)),
                average_score=Avg("attempts__score", filter=Q(attempts__status=QuizAttempt.Status.SUBMITTED)),
            )
            .values("id", "title", "course_id", "submitted_attempt_count", "average_score")
            .order_by("id")
        )
        by_quiz = [
            {
                "id": quiz["id"],
                "title": quiz["title"],
                "course_id": quiz["course_id"],
                "attempts": quiz["submitted_attempt_count"],
                "average_score": quiz["average_score"],
            }
            for quiz in quiz_rows
        ]
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
        assignments = Assignment.objects.all()
        if not is_admin(request.user):
            assignments = assignments.filter(course__instructor=request.user)
            submissions = submissions.filter(assignment__course__instructor=request.user)
        assignment_rows = (
            assignments.annotate(
                submission_count=Count(
                    "submissions",
                    filter=Q(
                        submissions__status__in=(AssignmentSubmission.Status.SUBMITTED, AssignmentSubmission.Status.GRADED)
                    ),
                ),
                graded_submission_count=Count(
                    "submissions",
                    filter=Q(submissions__status=AssignmentSubmission.Status.GRADED),
                ),
                average_score=Avg("submissions__score", filter=Q(submissions__status=AssignmentSubmission.Status.GRADED)),
            )
            .values("id", "title", "course_id", "submission_count", "graded_submission_count", "average_score")
            .order_by("id")
        )
        by_assignment = [
            {
                "id": assignment["id"],
                "title": assignment["title"],
                "course_id": assignment["course_id"],
                "submissions": assignment["submission_count"],
                "graded_submissions": assignment["graded_submission_count"],
                "average_score": assignment["average_score"],
            }
            for assignment in assignment_rows
        ]
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
        enrollments = Enrollment.objects.all()
        lesson_progress = CourseProgress.objects.filter(completed=True)
        quiz_attempts = QuizAttempt.objects.all()
        assignment_submissions = AssignmentSubmission.objects.exclude(status=AssignmentSubmission.Status.DRAFT)
        if not is_admin(request.user):
            enrollments = enrollments.filter(course__instructor=request.user)
            lesson_progress = lesson_progress.filter(enrollment__course__instructor=request.user)
            quiz_attempts = quiz_attempts.filter(quiz__course__instructor=request.user)
            assignment_submissions = assignment_submissions.filter(assignment__course__instructor=request.user)

        return Response(
            {
                "total_enrollments": enrollments.count(),
                "completed_lessons": lesson_progress.count(),
                "quiz_attempts": quiz_attempts.count(),
                "assignment_submissions": assignment_submissions.count(),
                "recent_enrollments": list(
                    enrollments.select_related("student", "course").order_by("-created_at").values(
                        "id", "student_id", "student__username", "course_id", "course__title", "created_at"
                    )[:10]
                ),
                "recent_lesson_completions": list(
                    lesson_progress
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

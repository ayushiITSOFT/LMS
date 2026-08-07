from django.urls import path

from .views import (
    AssignmentPerformanceView,
    CourseCompletionRateView,
    EnrollmentTrendsView,
    QuizPerformanceView,
    RevenueTrendsView,
    StudentActivityView,
)


app_name = "analytics"

urlpatterns = [
    path("course-completion-rate/", CourseCompletionRateView.as_view(), name="course-completion-rate"),
    path("enrollment-trends/", EnrollmentTrendsView.as_view(), name="enrollment-trends"),
    path("revenue-trends/", RevenueTrendsView.as_view(), name="revenue-trends"),
    path("quiz-performance/", QuizPerformanceView.as_view(), name="quiz-performance"),
    path("assignment-performance/", AssignmentPerformanceView.as_view(), name="assignment-performance"),
    path("student-activity/", StudentActivityView.as_view(), name="student-activity"),
]

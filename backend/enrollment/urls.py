from django.urls import path

from .views import (
    EnrollmentListView,
    LessonCompleteView,
    MyCourseLessonView,
    MyCourseDetailView,
    MyCourseListView,
    MyCourseResumeView,
    StudentDashboardView,
)

app_name = "enrollment"

urlpatterns = [
    path("", EnrollmentListView.as_view(), name="list"),
    path("my-courses/", MyCourseListView.as_view(), name="my-courses"),
    path("my-courses/<int:course_pk>/", MyCourseDetailView.as_view(), name="my-course-detail"),
    path("dashboard/", StudentDashboardView.as_view(), name="dashboard"),
    path("my-courses/<int:course_pk>/resume/", MyCourseResumeView.as_view(), name="my-course-resume"),
    path("my-courses/<int:course_pk>/lessons/<int:lesson_pk>/", MyCourseLessonView.as_view(), name="my-course-lesson"),
    path(
        "my-courses/<int:course_pk>/lessons/<int:lesson_pk>/complete/",
        LessonCompleteView.as_view(),
        name="lesson-complete",
    ),
]

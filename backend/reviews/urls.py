from django.urls import path

from .views import CourseReviewDetailView, CourseReviewListCreateView

app_name = "reviews"

urlpatterns = [
    path("courses/<int:course_pk>/reviews/", CourseReviewListCreateView.as_view(), name="course-review-list-create"),
    path("courses/<int:course_pk>/reviews/<int:pk>/", CourseReviewDetailView.as_view(), name="course-review-detail"),
]

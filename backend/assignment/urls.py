from django.urls import path

from .views import (
    AssignmentDetailView,
    AssignmentListCreateView,
    AssignmentSubmissionDetailView,
    AssignmentSubmissionListCreateView,
)

app_name = "assignment"

urlpatterns = [
    path("courses/<int:course_pk>/assignments/", AssignmentListCreateView.as_view(), name="assignment-list-create"),
    path("courses/<int:course_pk>/assignments/<int:pk>/", AssignmentDetailView.as_view(), name="assignment-detail"),
    path(
        "courses/<int:course_pk>/assignments/<int:assignment_pk>/submissions/",
        AssignmentSubmissionListCreateView.as_view(),
        name="submission-list-create",
    ),
    path(
        "courses/<int:course_pk>/assignments/<int:assignment_pk>/submissions/<int:pk>/",
        AssignmentSubmissionDetailView.as_view(),
        name="submission-detail",
    ),
]

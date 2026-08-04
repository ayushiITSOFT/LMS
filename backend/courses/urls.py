from django.urls import path

from .views import (
    CourseCreateView,
    CourseDiscoveryListView,
    CoursePreviewView,
    CourseRetrieveUpdateDestroyView,
    CoursePublishView,
    LessonListCreateView,
    LessonDetailView,
    LessonPreviewView,
    SectionListCreateView,
    SectionDetailView,
)


app_name = "courses"

urlpatterns = [
    # Course endpoints
    path("", CourseCreateView.as_view(), name="create"),
    path("discover/", CourseDiscoveryListView.as_view(), name="discover"),
    path("<int:pk>/", CourseRetrieveUpdateDestroyView.as_view(), name="detail"),
    path("<int:pk>/publish/", CoursePublishView.as_view(), name="publish"),
    path("<int:pk>/preview/", CoursePreviewView.as_view(), name="preview"),

    # Sections (course builder)
    path("<int:course_pk>/sections/", SectionListCreateView.as_view(), name="sections-list"),
    path("<int:course_pk>/sections/<int:pk>/", SectionDetailView.as_view(), name="sections-detail"),

    # Lessons (within a section)
    path(
        "<int:course_pk>/sections/<int:section_pk>/lessons/",
        LessonListCreateView.as_view(),
        name="lessons-list",
    ),
    path(
        "<int:course_pk>/sections/<int:section_pk>/lessons/<int:pk>/",
        LessonDetailView.as_view(),
        name="lessons-detail",
    ),
    path(
        "<int:course_pk>/sections/<int:section_pk>/lessons/<int:pk>/preview/",
        LessonPreviewView.as_view(),
        name="lesson-preview",
    ),
]

from django.urls import path

from .views import CourseAnnouncementDetailView, CourseAnnouncementListCreateView, CourseAnnouncementPinView


app_name = "announcements"

urlpatterns = [
    path("courses/<int:course_pk>/announcements/", CourseAnnouncementListCreateView.as_view(), name="list-create"),
    path("courses/<int:course_pk>/announcements/<int:pk>/", CourseAnnouncementDetailView.as_view(), name="detail"),
    path("courses/<int:course_pk>/announcements/<int:pk>/pin/", CourseAnnouncementPinView.as_view(), name="pin"),
]

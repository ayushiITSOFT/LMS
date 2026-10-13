from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import is_admin, is_instructor, is_student
from audit_logs.models import AuditLog
from audit_logs.services import log_admin_action, snapshot
from courses.models import Course
from enrollment.models import Enrollment
from .models import CourseAnnouncement
from .serializers import CourseAnnouncementSerializer


def can_manage_course(user, course):
    return is_admin(user) or (is_instructor(user) and course.instructor_id == user.id)


def can_view_course_announcements(user, course):
    return can_manage_course(user, course) or (
        is_student(user) and Enrollment.objects.filter(student=user, course=course).exists()
    )


class CourseAnnouncementListCreateView(generics.ListCreateAPIView):
    serializer_class = CourseAnnouncementSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_course(self):
        return get_object_or_404(Course, pk=self.kwargs.get("course_pk"))

    def get_queryset(self):
        course = self.get_course()
        if not can_view_course_announcements(self.request.user, course):
            raise PermissionDenied("You cannot view announcements for this course.")
        return CourseAnnouncement.objects.filter(course=course).select_related("course", "created_by")

    def perform_create(self, serializer):
        course = self.get_course()
        if not can_manage_course(self.request.user, course):
            raise PermissionDenied("Only the course instructor can create announcements.")
        serializer.save(course=course, created_by=self.request.user)


class CourseAnnouncementDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CourseAnnouncementSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        course = get_object_or_404(Course, pk=self.kwargs.get("course_pk"))
        if self.request.method == "GET":
            if not can_view_course_announcements(self.request.user, course):
                raise PermissionDenied("You cannot view announcements for this course.")
        elif not can_manage_course(self.request.user, course):
            raise PermissionDenied("Only the course instructor can manage announcements.")
        return CourseAnnouncement.objects.filter(course=course).select_related("course", "created_by")

    def perform_update(self, serializer):
        previous = snapshot(self.get_object())
        instance = serializer.save()
        log_admin_action(self.request.user, AuditLog.Action.UPDATE, instance, previous, snapshot(instance))

    def perform_destroy(self, instance):
        previous = snapshot(instance)
        log_admin_action(self.request.user, AuditLog.Action.DELETE, instance, previous, None)
        instance.delete()


class CourseAnnouncementPinView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, course_pk, pk):
        course = get_object_or_404(Course, pk=course_pk)
        if not can_manage_course(request.user, course):
            return Response({"detail": "Only the course instructor can pin announcements."}, status=status.HTTP_403_FORBIDDEN)

        announcement = get_object_or_404(CourseAnnouncement, pk=pk, course=course)
        previous = snapshot(announcement)
        announcement.is_pinned = not announcement.is_pinned
        announcement.save(update_fields=("is_pinned", "updated_at"))
        log_admin_action(request.user, AuditLog.Action.UPDATE, announcement, previous, snapshot(announcement))
        return Response(CourseAnnouncementSerializer(announcement).data, status=status.HTTP_200_OK)

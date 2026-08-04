from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions

from courses.models import Course
from accounts.permissions import CanManageOwnCourse
from .models import Assignment, AssignmentSubmission
from .serializers import AssignmentSerializer, AssignmentSubmissionSerializer


class AssignmentListCreateView(generics.ListCreateAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        course = get_object_or_404(Course, pk=self.kwargs.get("course_pk"))
        if not self.request.user.is_staff and self.request.user.role != "instructor":
            return Assignment.objects.none()
        self.check_object_permissions(self.request, course)
        return Assignment.objects.filter(course=course)

    def perform_create(self, serializer):
        course = get_object_or_404(Course, pk=self.kwargs.get("course_pk"))
        if not self.request.user.is_staff and self.request.user.role != "instructor":
            self.permission_denied(self.request, message="Only instructors or admins can manage assignments.")
        self.check_object_permissions(self.request, course)
        serializer.context["course_id"] = course.id
        serializer.save()

    def get_permissions(self):
        if self.request.method in {"GET", "POST"}:
            return [permissions.IsAuthenticated(), CanManageOwnCourse()]
        return [permissions.IsAuthenticated()]


class AssignmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = (permissions.IsAuthenticated, CanManageOwnCourse)

    def get_queryset(self):
        course = get_object_or_404(Course, pk=self.kwargs.get("course_pk"))
        self.check_object_permissions(self.request, course)
        return Assignment.objects.filter(course=course)


class AssignmentSubmissionListCreateView(generics.ListCreateAPIView):
    serializer_class = AssignmentSubmissionSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        assignment = get_object_or_404(Assignment, pk=self.kwargs.get("assignment_pk"), course_id=self.kwargs.get("course_pk"))
        if self.request.user.is_staff or self.request.user.role == "instructor":
            return AssignmentSubmission.objects.filter(assignment=assignment)
        return AssignmentSubmission.objects.filter(assignment=assignment, student=self.request.user)

    def perform_create(self, serializer):
        assignment = get_object_or_404(Assignment, pk=self.kwargs.get("assignment_pk"), course_id=self.kwargs.get("course_pk"))
        serializer.save(assignment=assignment, student=self.request.user)


class AssignmentSubmissionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AssignmentSubmissionSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        assignment = get_object_or_404(Assignment, pk=self.kwargs.get("assignment_pk"), course_id=self.kwargs.get("course_pk"))
        if self.request.user.is_staff or self.request.user.role == "instructor":
            return AssignmentSubmission.objects.filter(assignment=assignment)
        return AssignmentSubmission.objects.filter(assignment=assignment, student=self.request.user)

from django.shortcuts import get_object_or_404
from django.db import IntegrityError, transaction
from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError

from courses.models import Course
from accounts.permissions import CanManageOwnCourse, is_admin, is_instructor, is_student
from audit_logs.models import AuditLog
from audit_logs.services import log_admin_action, snapshot
from enrollment.models import Enrollment
from .models import Assignment, AssignmentSubmission
from .serializers import AssignmentGradeSerializer, AssignmentSerializer, AssignmentSubmissionSerializer


def can_manage_course(user, course):
    return is_admin(user) or (is_instructor(user) and course.instructor_id == user.id)


def is_enrolled(user, course):
    return is_student(user) and Enrollment.objects.filter(student=user, course=course).exists()


class AssignmentListCreateView(generics.ListCreateAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["course_id"] = self.kwargs.get("course_pk")
        return context

    def get_queryset(self):
        course = get_object_or_404(Course, pk=self.kwargs.get("course_pk"))
        if can_manage_course(self.request.user, course):
            return Assignment.objects.filter(course=course).select_related("course", "lesson")
        if is_instructor(self.request.user) or is_admin(self.request.user):
            self.permission_denied(self.request, message="Only the course instructor can manage assignments.")
        if is_enrolled(self.request.user, course):
            return Assignment.objects.filter(course=course, status=Assignment.Status.PUBLISHED).select_related("course", "lesson")
        return Assignment.objects.none()

    def perform_create(self, serializer):
        course = get_object_or_404(Course, pk=self.kwargs.get("course_pk"))
        if not can_manage_course(self.request.user, course):
            self.permission_denied(self.request, message="Only instructors or admins can manage assignments.")
        serializer.save()

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), CanManageOwnCourse()]
        return [permissions.IsAuthenticated()]


class AssignmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["course_id"] = self.kwargs.get("course_pk")
        return context

    def get_queryset(self):
        course = get_object_or_404(Course, pk=self.kwargs.get("course_pk"))
        if can_manage_course(self.request.user, course):
            return Assignment.objects.filter(course=course).select_related("course", "lesson")
        if is_instructor(self.request.user) or is_admin(self.request.user):
            self.permission_denied(self.request, message="Only the course instructor can manage assignments.")
        if self.request.method == "GET" and is_enrolled(self.request.user, course):
            return Assignment.objects.filter(course=course, status=Assignment.Status.PUBLISHED).select_related("course", "lesson")
        return Assignment.objects.none()

    def perform_update(self, serializer):
        previous = snapshot(self.get_object())
        instance = serializer.save()
        log_admin_action(self.request.user, AuditLog.Action.UPDATE, instance, previous, snapshot(instance))

    def perform_destroy(self, instance):
        previous = snapshot(instance)
        log_admin_action(self.request.user, AuditLog.Action.DELETE, instance, previous, None)
        instance.delete()


class AssignmentSubmissionListCreateView(generics.ListCreateAPIView):
    serializer_class = AssignmentSubmissionSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        assignment = get_object_or_404(Assignment, pk=self.kwargs.get("assignment_pk"), course_id=self.kwargs.get("course_pk"))
        queryset = AssignmentSubmission.objects.filter(assignment=assignment).select_related("assignment__course", "student")
        if can_manage_course(self.request.user, assignment.course):
            return queryset
        if is_instructor(self.request.user) or is_admin(self.request.user):
            self.permission_denied(self.request, message="Only the course instructor can view submissions.")
        if is_enrolled(self.request.user, assignment.course):
            return queryset.filter(student=self.request.user)
        return queryset.none()

    def perform_create(self, serializer):
        assignment = get_object_or_404(Assignment, pk=self.kwargs.get("assignment_pk"), course_id=self.kwargs.get("course_pk"))
        if not is_enrolled(self.request.user, assignment.course):
            self.permission_denied(self.request, message="Only enrolled students can submit assignments.")
        if assignment.status != Assignment.Status.PUBLISHED:
            self.permission_denied(self.request, message="Only published assignments can be submitted.")
        if AssignmentSubmission.objects.filter(assignment=assignment, student=self.request.user).exists():
            raise ValidationError({"detail": "You have already submitted this assignment."})
        try:
            with transaction.atomic():
                serializer.save(assignment=assignment, student=self.request.user)
        except IntegrityError:
            raise ValidationError({"detail": "You have already submitted this assignment."})


class AssignmentSubmissionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AssignmentSubmissionSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_serializer_class(self):
        if self.request.method in {"PUT", "PATCH"}:
            return AssignmentGradeSerializer
        return AssignmentSubmissionSerializer

    def get_queryset(self):
        assignment = get_object_or_404(Assignment, pk=self.kwargs.get("assignment_pk"), course_id=self.kwargs.get("course_pk"))
        queryset = AssignmentSubmission.objects.filter(assignment=assignment).select_related("assignment__course", "student")
        if can_manage_course(self.request.user, assignment.course):
            return queryset
        if is_instructor(self.request.user) or is_admin(self.request.user):
            self.permission_denied(self.request, message="Only the course instructor can view submissions.")
        if is_enrolled(self.request.user, assignment.course):
            return queryset.filter(student=self.request.user)
        return queryset.none()

    def perform_update(self, serializer):
        if not can_manage_course(self.request.user, serializer.instance.assignment.course):
            self.permission_denied(self.request, message="Only the course instructor can grade submissions.")
        previous = snapshot(self.get_object())
        instance = serializer.save(status=AssignmentSubmission.Status.GRADED)
        log_admin_action(self.request.user, AuditLog.Action.UPDATE, instance, previous, snapshot(instance))

    def perform_destroy(self, instance):
        if not can_manage_course(self.request.user, instance.assignment.course):
            self.permission_denied(self.request, message="Only the course instructor can delete submissions.")
        previous = snapshot(instance)
        log_admin_action(self.request.user, AuditLog.Action.DELETE, instance, previous, None)
        instance.delete()

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
    if not user or not user.is_authenticated:
        return False
    if is_admin(user):
        return True
    return is_instructor(user) and (
        getattr(course, "instructor_id", None) == user.id or getattr(course, "instructor", None) == user
    )


def is_enrolled(user, course):
    return is_student(user) and Enrollment.objects.filter(student=user, course=course).exists()


class AssignmentListCreateView(generics.ListCreateAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["course_id"] = self.kwargs.get("course_pk")
        return context

    def check_permissions(self, request):
        super().check_permissions(request)
        course = get_object_or_404(Course, pk=self.kwargs.get("course_pk"))
        if request.method not in ("GET", "HEAD", "OPTIONS") and is_instructor(request.user) and not can_manage_course(request.user, course):
            self.permission_denied(request, message="Only the course instructor or admin can manage assignments for this course.")

    def get_queryset(self):
        course = get_object_or_404(Course, pk=self.kwargs.get("course_pk"))
        return Assignment.objects.filter(course=course).select_related("course", "lesson")

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

    def check_permissions(self, request):
        super().check_permissions(request)
        course = get_object_or_404(Course, pk=self.kwargs.get("course_pk"))
        if request.method not in ("GET", "HEAD", "OPTIONS") and is_instructor(request.user) and not can_manage_course(request.user, course):
            self.permission_denied(request, message="Only the course instructor or admin can update assignments for this course.")

    def get_queryset(self):
        course = get_object_or_404(Course, pk=self.kwargs.get("course_pk"))
        return Assignment.objects.filter(course=course).select_related("course", "lesson")

    def perform_update(self, serializer):
        if not can_manage_course(self.request.user, serializer.instance.course):
            self.permission_denied(self.request, message="Only course instructor or admin can update assignments.")
        previous = snapshot(self.get_object())
        instance = serializer.save()
        log_admin_action(self.request.user, AuditLog.Action.UPDATE, instance, previous, snapshot(instance))

    def perform_destroy(self, instance):
        if not can_manage_course(self.request.user, instance.course):
            self.permission_denied(self.request, message="Only course instructor or admin can delete assignments.")
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
    permission_classes = (permissions.IsAuthenticated,)

    def get_serializer_class(self):
        submission = self.get_object()
        if can_manage_course(self.request.user, submission.assignment.course):
            return AssignmentGradeSerializer
        return AssignmentSubmissionSerializer

    def get_queryset(self):
        assignment = get_object_or_404(Assignment, pk=self.kwargs.get("assignment_pk"), course_id=self.kwargs.get("course_pk"))
        queryset = AssignmentSubmission.objects.filter(assignment=assignment).select_related("assignment__course", "student")
        if can_manage_course(self.request.user, assignment.course):
            return queryset
        if is_enrolled(self.request.user, assignment.course):
            return queryset.filter(student=self.request.user)
        return queryset.none()

    def perform_update(self, serializer):
        instance = serializer.instance
        if can_manage_course(self.request.user, instance.assignment.course):
            previous = snapshot(instance)
            updated = serializer.save(status=AssignmentSubmission.Status.GRADED)
            log_admin_action(self.request.user, AuditLog.Action.UPDATE, updated, previous, snapshot(updated))
        elif instance.student == self.request.user:
            if instance.status == AssignmentSubmission.Status.GRADED:
                self.permission_denied(self.request, message="Graded submissions cannot be edited.")
            from django.utils import timezone

            next_status = serializer.validated_data.get("status", instance.status)
            extra_kwargs = {}
            if next_status == AssignmentSubmission.Status.SUBMITTED and not instance.submitted_at:
                extra_kwargs["submitted_at"] = timezone.now()
            serializer.save(**extra_kwargs)
        else:
            self.permission_denied(self.request, message="You do not have permission to modify this submission.")

    def perform_destroy(self, instance):
        if not can_manage_course(self.request.user, instance.assignment.course):
            self.permission_denied(self.request, message="Only the course instructor can delete submissions.")
        previous = snapshot(instance)
        log_admin_action(self.request.user, AuditLog.Action.DELETE, instance, previous, None)
        instance.delete()

from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied, ValidationError

from accounts.permissions import is_student
from courses.models import Course
from enrollment.models import Enrollment
from .models import CourseReview
from .serializers import CourseReviewSerializer


class CourseReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = CourseReviewSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        course = get_object_or_404(Course, pk=self.kwargs.get("course_pk"))
        return CourseReview.objects.filter(course=course).select_related("course", "student", "enrollment")

    def perform_create(self, serializer):
        if not is_student(self.request.user):
            raise PermissionDenied("Only students can create course reviews.")

        course = get_object_or_404(Course, pk=self.kwargs.get("course_pk"))
        enrollment = get_object_or_404(Enrollment, course=course, student=self.request.user)
        if CourseReview.objects.filter(course=course, student=self.request.user).exists():
            raise ValidationError({"detail": "You have already reviewed this course."})

        serializer.save(course=course, student=self.request.user, enrollment=enrollment)


class CourseReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CourseReviewSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return CourseReview.objects.filter(student=self.request.user).select_related("course", "student", "enrollment")

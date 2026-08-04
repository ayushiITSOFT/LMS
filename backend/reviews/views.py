from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions

from courses.models import Course
from enrollment.models import Enrollment
from .models import CourseReview
from .serializers import CourseReviewSerializer


class CourseReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = CourseReviewSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        course = get_object_or_404(Course, pk=self.kwargs.get("course_pk"))
        return CourseReview.objects.filter(course=course)

    def perform_create(self, serializer):
        course = get_object_or_404(Course, pk=self.kwargs.get("course_pk"))
        enrollment = get_object_or_404(Enrollment, course=course, student=self.request.user)
        serializer.save(course=course, student=self.request.user, enrollment=enrollment)


class CourseReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CourseReviewSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return CourseReview.objects.filter(student=self.request.user)

from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from courses.models import Lesson
from .models import Enrollment, CourseProgress
from .serializers import EnrollmentSerializer, MyCourseDetailSerializer, MyCourseSummarySerializer
from accounts.permissions import is_student


class EnrollmentListView(generics.ListAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if not is_student(self.request.user):
            return Enrollment.objects.none()
        return Enrollment.objects.filter(student=self.request.user).select_related("course", "order")


class MyCourseListView(generics.ListAPIView):
    serializer_class = MyCourseSummarySerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if not is_student(self.request.user):
            return Enrollment.objects.none()
        return Enrollment.objects.filter(student=self.request.user).select_related("course")


class MyCourseDetailView(generics.RetrieveAPIView):
    serializer_class = MyCourseDetailSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        if not is_student(self.request.user):
            raise PermissionDenied("Only students can view their courses.")
        return get_object_or_404(
            Enrollment.objects.filter(student=self.request.user).select_related("course"),
            course_id=self.kwargs.get("course_pk"),
        )


class MyCourseResumeView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, course_pk):
        if not is_student(request.user):
            return Response({"detail": "Only students can view course progress."}, status=status.HTTP_403_FORBIDDEN)

        enrollment = get_object_or_404(
            Enrollment.objects.filter(student=request.user).select_related("course"),
            course_id=course_pk,
        )
        lessons = Lesson.objects.filter(section__course=enrollment.course).select_related("section").order_by("section__order", "order")
        for lesson in lessons:
            if not CourseProgress.objects.filter(enrollment=enrollment, lesson=lesson, completed=True).exists():
                return Response(
                    {
                        "course_id": enrollment.course.id,
                        "course_title": enrollment.course.title,
                        "lesson": {
                            "id": lesson.id,
                            "title": lesson.title,
                            "kind": lesson.kind,
                            "section_title": lesson.section.title,
                        },
                    },
                    status=status.HTTP_200_OK,
                )
        return Response({"detail": "No lesson remaining."}, status=status.HTTP_200_OK)


class LessonCompleteView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, course_pk, lesson_pk):
        if not is_student(request.user):
            return Response({"detail": "Only students can update lesson progress."}, status=status.HTTP_403_FORBIDDEN)

        enrollment = get_object_or_404(
            Enrollment.objects.filter(student=request.user).select_related("course"),
            course_id=course_pk,
        )
        lesson = get_object_or_404(Lesson.objects.select_related("section"), pk=lesson_pk, section__course=enrollment.course)

        progress, created = CourseProgress.objects.get_or_create(enrollment=enrollment, lesson=lesson)
        progress.mark_completed()

        return Response(
            {
                "message": "Lesson marked as completed",
                "progress_percentage": enrollment.get_progress_percentage(),
                "course_completed": enrollment.is_course_completed(),
                "lesson": {
                    "id": lesson.id,
                    "title": lesson.title,
                    "kind": lesson.kind,
                    "section_title": lesson.section.title,
                },
            },
            status=status.HTTP_200_OK,
        )

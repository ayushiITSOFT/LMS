from django.core.exceptions import ValidationError
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Course, Section, Lesson
from .permissions import CanPreviewCourse
from .serializers import (
    CourseSerializer,
    CourseDiscoverySerializer,
    CoursePreviewSerializer,
    LessonSerializer,
    LessonPreviewSerializer,
    SectionSerializer,
)
from accounts.permissions import CanCreateCourse, CanManageOwnCourse


class CourseDiscoveryPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class CourseCreateView(generics.CreateAPIView):
    """Create a course. Only instructors (or admin) may create courses."""

    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = (permissions.IsAuthenticated, CanCreateCourse)


class CourseDiscoveryListView(generics.ListAPIView):
    """Browse published courses with search, filters, ordering, and pagination."""

    serializer_class = CourseDiscoverySerializer
    permission_classes = (permissions.AllowAny,)
    pagination_class = CourseDiscoveryPagination

    def get_queryset(self):
        queryset = Course.objects.filter(status=Course.Status.PUBLISHED).select_related("instructor")

        search = (self.request.query_params.get("search") or "").strip()
        category = (self.request.query_params.get("category") or "").strip()
        level = (self.request.query_params.get("level") or "").strip()
        language = (self.request.query_params.get("language") or "").strip()
        status_filter = (self.request.query_params.get("status") or "").strip()
        price_min = self.request.query_params.get("price_min")
        price_max = self.request.query_params.get("price_max")
        is_paid = self.request.query_params.get("is_paid")
        ordering = (self.request.query_params.get("ordering") or self.request.query_params.get("sort") or "-created_at").strip()

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(subtitle__icontains=search)
                | Q(description__icontains=search)
                | Q(category__icontains=search)
                | Q(language__icontains=search)
            )

        if category:
            queryset = queryset.filter(category__icontains=category)

        if level:
            queryset = queryset.filter(level=level)

        if language:
            queryset = queryset.filter(language__icontains=language)

        if status_filter:
            queryset = queryset.filter(status=status_filter)

        if price_min is not None and price_min != "":
            queryset = queryset.filter(price__gte=price_min)

        if price_max is not None and price_max != "":
            queryset = queryset.filter(price__lte=price_max)

        if is_paid is not None and is_paid != "":
            if str(is_paid).lower() in {"1", "true", "yes"}:
                queryset = queryset.filter(price__gt=0)
            else:
                queryset = queryset.filter(price=0)

        allowed_orderings = {
            "created_at": "created_at",
            "-created_at": "-created_at",
            "price": "price",
            "-price": "-price",
            "title": "title",
            "-title": "-title",
            "updated_at": "updated_at",
            "-updated_at": "-updated_at",
        }
        queryset = queryset.order_by(allowed_orderings.get(ordering, "-created_at"))

        return queryset


class CourseRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a course. Update/Delete restricted to owner or admin."""

    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_permissions(self):
        # Read requires authentication, edits require ownership/admin
        if self.request.method in ("PUT", "PATCH", "DELETE"):
            return [permissions.IsAuthenticated(), CanManageOwnCourse()]
        return [permissions.IsAuthenticated()]


class CoursePublishView(APIView):
    """Publish a course (set status to Published). Only owner (instructor) or admin."""

    permission_classes = (permissions.IsAuthenticated, CanManageOwnCourse)

    def post(self, request, pk):
        course = get_object_or_404(Course, pk=pk)
        self.check_object_permissions(request, course)

        try:
            course.publish()
        except ValidationError as exc:
            return Response(
                {
                    "detail": "Course cannot be published yet.",
                    "errors": exc.message_dict,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = CourseSerializer(course, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class CoursePreviewView(APIView):
    """Allow preview access to a course prior to publishing."""

    permission_classes = (permissions.IsAuthenticated, CanPreviewCourse)

    def get(self, request, pk):
        course = get_object_or_404(Course, pk=pk)
        self.check_object_permissions(request, course)
        serializer = CoursePreviewSerializer(course, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class LessonPreviewView(APIView):
    """Allow preview access to an individual lesson if it is marked preview."""

    permission_classes = (permissions.IsAuthenticated, CanPreviewCourse)

    def get(self, request, course_pk, section_pk, pk):
        section = get_object_or_404(Section, pk=section_pk, course_id=course_pk)
        lesson = get_object_or_404(Lesson, pk=pk, section=section)
        self.check_object_permissions(request, lesson)
        serializer = LessonPreviewSerializer(lesson, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


# Course Builder views: Sections and Lessons

class SectionListCreateView(generics.ListCreateAPIView):
    """List and create sections for a course. Only course owner/admin may manage."""

    serializer_class = SectionSerializer
    permission_classes = (permissions.IsAuthenticated, CanManageOwnCourse)

    def get_course(self):
        return get_object_or_404(Course, pk=self.kwargs.get("course_pk"))

    def get_queryset(self):
        course = self.get_course()
        # enforce owner/admin permission on the course
        self.check_object_permissions(self.request, course)
        return course.sections.all().order_by("order")

    def perform_create(self, serializer):
        course = self.get_course()
        self.check_object_permissions(self.request, course)
        serializer.save(course=course)


class SectionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a section. Only owner/admin may manage."""

    serializer_class = SectionSerializer
    permission_classes = (permissions.IsAuthenticated, CanManageOwnCourse)

    def get_object(self):
        course = get_object_or_404(Course, pk=self.kwargs.get("course_pk"))
        section = get_object_or_404(Section, pk=self.kwargs.get("pk"), course=course)
        # enforce owner/admin permission on the course
        self.check_object_permissions(self.request, course)
        return section


class LessonListCreateView(generics.ListCreateAPIView):
    """List and create lessons inside a section. Only course owner/admin may manage."""

    serializer_class = LessonSerializer
    permission_classes = (permissions.IsAuthenticated, CanManageOwnCourse)

    def get_section(self):
        return get_object_or_404(
            Section, pk=self.kwargs.get("section_pk"), course_id=self.kwargs.get("course_pk")
        )

    def get_queryset(self):
        section = self.get_section()
        # enforce owner/admin permission on the course
        self.check_object_permissions(self.request, section.course)
        return section.lessons.all().order_by("order")

    def perform_create(self, serializer):
        section = self.get_section()
        self.check_object_permissions(self.request, section.course)
        serializer.save(section=section)


class LessonDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a lesson. Only course owner/admin may manage."""

    serializer_class = LessonSerializer
    permission_classes = (permissions.IsAuthenticated, CanManageOwnCourse)

    def get_object(self):
        section = get_object_or_404(
            Section, pk=self.kwargs.get("section_pk"), course_id=self.kwargs.get("course_pk")
        )
        lesson = get_object_or_404(Lesson, pk=self.kwargs.get("pk"), section=section)
        # enforce owner/admin permission on the course
        self.check_object_permissions(self.request, section.course)
        return lesson

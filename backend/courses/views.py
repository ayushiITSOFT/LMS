from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db.models import Avg, Count, Sum
from django.shortcuts import get_object_or_404
from rest_framework import filters, generics, permissions, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from .filters import CourseSearchFilter
from .models import Course, Section, Lesson
from .permissions import CanPreviewCourse
from .serializers import (
    CourseSerializer,
    CourseDiscoverySerializer,
    InstructorDashboardSerializer,
    CoursePreviewSerializer,
    LessonSerializer,
    LessonPreviewSerializer,
    SectionSerializer,
)
from accounts.permissions import CanCreateCourse, CanManageOwnCourse, is_instructor
from audit_logs.models import AuditLog
from audit_logs.services import log_admin_action, snapshot
from enrollment.models import Enrollment
from orders.models import Order, OrderItem


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
    filter_backends = (CourseSearchFilter, filters.OrderingFilter)
    ordering = "-created_at"
    ordering_fields = ("created_at", "updated_at", "price", "title", "average_rating")

    def get_queryset(self):
        queryset = (
            Course.objects.filter(status=Course.Status.PUBLISHED)
            .select_related("instructor")
            .annotate(average_rating=Avg("reviews__rating"), review_count=Count("reviews"))
        )
        language = (self.request.query_params.get("language") or "").strip()
        is_paid = self.request.query_params.get("is_paid")

        if language:
            queryset = queryset.filter(language__icontains=language)

        if is_paid is not None and is_paid != "":
            if str(is_paid).lower() in {"1", "true", "yes"}:
                queryset = queryset.filter(price__gt=0)
            else:
                queryset = queryset.filter(price=0)

        return queryset


class InstructorDashboardView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        if not is_instructor(request.user):
            return Response({"detail": "Only instructors can access the dashboard."}, status=status.HTTP_403_FORBIDDEN)

        courses = Course.objects.filter(instructor=request.user)
        course_ids = courses.values_list("id", flat=True)
        review_stats = courses.aggregate(
            average_rating=Avg("reviews__rating"),
            total_reviews=Count("reviews", distinct=True),
        )
        total_revenue = OrderItem.objects.filter(
            course_id__in=course_ids,
            order__status=Order.Status.PAID,
        ).aggregate(total=Sum("price"))["total"] or Decimal("0.00")

        data = {
            "total_courses": courses.count(),
            "published_courses": courses.filter(status=Course.Status.PUBLISHED).count(),
            "draft_courses": courses.filter(status=Course.Status.DRAFT).count(),
            "total_students": Enrollment.objects.filter(course_id__in=course_ids).values("student_id").distinct().count(),
            "total_revenue": total_revenue,
            "average_rating": round(review_stats["average_rating"] or 0, 2),
            "total_reviews": review_stats["total_reviews"],
            "recent_enrollments": Enrollment.objects.filter(course_id__in=course_ids).select_related("student", "course").order_by("-created_at")[:10],
        }

        return Response(InstructorDashboardSerializer(data).data, status=status.HTTP_200_OK)


class CourseRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a course. Update/Delete restricted to owner or admin."""

    queryset = Course.objects.select_related("instructor").prefetch_related("sections__lessons")
    serializer_class = CourseSerializer

    def get_permissions(self):
        # Read requires authentication, edits require ownership/admin
        if self.request.method in ("PUT", "PATCH", "DELETE"):
            return [permissions.IsAuthenticated(), CanManageOwnCourse()]
        return [permissions.IsAuthenticated()]

    def perform_update(self, serializer):
        previous = snapshot(self.get_object())
        instance = serializer.save()
        log_admin_action(self.request.user, AuditLog.Action.UPDATE, instance, previous, snapshot(instance))

    def perform_destroy(self, instance):
        previous = snapshot(instance)
        log_admin_action(self.request.user, AuditLog.Action.DELETE, instance, previous, None)
        instance.delete()


class CoursePublishView(APIView):
    """Publish a course (set status to Published). Only owner (instructor) or admin."""

    permission_classes = (permissions.IsAuthenticated, CanManageOwnCourse)

    def post(self, request, pk):
        course = get_object_or_404(Course, pk=pk)
        self.check_object_permissions(request, course)

        try:
            previous = snapshot(course)
            course.publish()
        except ValidationError as exc:
            return Response(
                {
                    "detail": "Course cannot be published yet.",
                    "errors": exc.message_dict,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        log_admin_action(request.user, AuditLog.Action.PUBLISH, course, previous, snapshot(course))
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
        return course.sections.prefetch_related("lessons").order_by("order")

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
        section = get_object_or_404(Section.objects.prefetch_related("lessons"), pk=self.kwargs.get("pk"), course=course)
        # enforce owner/admin permission on the course
        self.check_object_permissions(self.request, course)
        return section

    def perform_update(self, serializer):
        previous = snapshot(self.get_object())
        instance = serializer.save()
        log_admin_action(self.request.user, AuditLog.Action.UPDATE, instance, previous, snapshot(instance))

    def perform_destroy(self, instance):
        previous = snapshot(instance)
        log_admin_action(self.request.user, AuditLog.Action.DELETE, instance, previous, None)
        instance.delete()


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
        return section.lessons.select_related("section__course").order_by("order")

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

    def perform_update(self, serializer):
        previous = snapshot(self.get_object())
        instance = serializer.save()
        log_admin_action(self.request.user, AuditLog.Action.UPDATE, instance, previous, snapshot(instance))

    def perform_destroy(self, instance):
        previous = snapshot(instance)
        log_admin_action(self.request.user, AuditLog.Action.DELETE, instance, previous, None)
        instance.delete()

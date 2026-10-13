from decimal import Decimal
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from django.db.models import Prefetch, Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import is_admin, is_instructor, is_student
from enrollment.models import Enrollment
from courses.models import Course, Section
from .models import Certificate
from .serializers import CertificateSerializer


class CertificateListView(generics.ListAPIView):
    serializer_class = CertificateSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        course_id = self.request.query_params.get("course") or self.request.query_params.get("course_id")
        teaching = self.request.query_params.get("teaching")

        if course_id:
            if is_admin(user):
                qs = Certificate.objects.filter(course_id=course_id)
            elif is_instructor(user):
                qs = Certificate.objects.filter(course_id=course_id, course__instructor=user)
            else:
                qs = Certificate.objects.filter(course_id=course_id, student=user)
            return qs.select_related("student", "course", "enrollment", "course__instructor").order_by("-issued_at")

        if teaching and is_instructor(user):
            return Certificate.objects.filter(course__instructor=user).select_related(
                "student", "course", "enrollment", "course__instructor"
            ).order_by("-issued_at")

        if is_admin(user):
            return Certificate.objects.all().select_related(
                "student", "course", "enrollment", "course__instructor"
            ).order_by("-issued_at")

        if is_student(user):
            # Auto-generate certificates for all enrollments that have reached 100% completion
            student_enrollments = Enrollment.objects.filter(student=user).prefetch_related(
                Prefetch("course__sections", queryset=Section.objects.prefetch_related("lessons")),
                "progress",
            )
            for enr in student_enrollments:
                if enr.is_course_completed() and not hasattr(enr, "certificate"):
                    try:
                        Certificate.objects.get_or_create(
                            enrollment=enr,
                            defaults={
                                "student": user,
                                "course": enr.course,
                                "progress_percentage": Decimal(str(enr.get_progress_percentage())),
                            },
                        )
                    except Exception:
                        pass

        return Certificate.objects.filter(student=user).select_related(
            "student", "course", "enrollment", "course__instructor"
        ).order_by("-issued_at")


class CertificateDetailView(generics.RetrieveAPIView):
    serializer_class = CertificateSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        if is_admin(user):
            return Certificate.objects.all().select_related("course", "enrollment", "student", "course__instructor")
        if is_instructor(user):
            return Certificate.objects.filter(
                Q(course__instructor=user) | Q(student=user)
            ).select_related("course", "enrollment", "student", "course__instructor")
        return Certificate.objects.filter(student=user).select_related("course", "enrollment", "student", "course__instructor")


class CertificateVerifyView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, certificate_id):
        certificate = get_object_or_404(
            Certificate.objects.select_related("student", "course", "enrollment", "course__instructor"),
            certificate_id=certificate_id,
        )
        return Response(
            {
                "valid": True,
                "certificate": CertificateSerializer(certificate, context={"request": request}).data,
            },
            status=status.HTTP_200_OK,
        )


class IssueCertificateView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, course_pk):
        course = get_object_or_404(Course, pk=course_pk)
        student_id = request.data.get("student_id")
        enrollment_id = request.data.get("enrollment_id")

        is_course_instructor = (course.instructor_id == request.user.id)
        caller_is_admin = is_admin(request.user)

        # Instructor or Admin issuing for a student enrollment
        if student_id or enrollment_id or is_course_instructor or caller_is_admin:
            if not (is_course_instructor or caller_is_admin):
                return Response(
                    {"detail": "You do not have permission to issue certificates for other students."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            lookup = {"course": course}
            if enrollment_id:
                lookup["id"] = enrollment_id
            elif student_id:
                lookup["student_id"] = student_id
            else:
                return Response(
                    {"detail": "Please specify a student_id or enrollment_id to issue a certificate."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            enrollment = get_object_or_404(
                Enrollment.objects.select_related("course", "student").prefetch_related(
                    Prefetch("course__sections", queryset=Section.objects.prefetch_related("lessons")),
                    "progress",
                ),
                **lookup,
            )

            # Strict completion check: certificate can only be issued after 100% course completion
            if not enrollment.is_course_completed():
                return Response(
                    {
                        "detail": "Certificate can only be issued after the student has completed 100% of the course lessons.",
                        "current_progress": enrollment.get_progress_percentage(),
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            progress_val = enrollment.get_progress_percentage()
            try:
                certificate, created = Certificate.objects.get_or_create(
                    enrollment=enrollment,
                    defaults={
                        "student": enrollment.student,
                        "course": course,
                        "progress_percentage": Decimal(str(progress_val)),
                    },
                )
            except ValidationError as exc:
                return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

            serializer = CertificateSerializer(certificate, context={"request": request})
            if not created:
                return Response(
                    {"detail": "Certificate already issued for this student.", "certificate": serializer.data},
                    status=status.HTTP_200_OK,
                )
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        # Student self-issuing
        enrollment = get_object_or_404(
            Enrollment.objects.select_related("course", "student").prefetch_related(
                Prefetch("course__sections", queryset=Section.objects.prefetch_related("lessons")),
                "progress",
            ),
            course=course,
            student=request.user,
        )

        if not enrollment.is_course_completed():
            return Response(
                {"detail": "Certificate can only be generated when course progress is 100%."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            certificate, created = Certificate.objects.get_or_create(
                enrollment=enrollment,
                defaults={
                    "student": request.user,
                    "course": course,
                    "progress_percentage": Decimal(str(enrollment.get_progress_percentage())),
                },
            )
        except ValidationError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        serializer = CertificateSerializer(certificate, context={"request": request})
        if not created:
            return Response(
                {"detail": "Certificate already issued.", "certificate": serializer.data},
                status=status.HTTP_200_OK,
            )
        return Response(serializer.data, status=status.HTTP_201_CREATED)

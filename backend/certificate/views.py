from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from django.db.models import Prefetch
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from enrollment.models import Enrollment
from courses.models import Section
from .models import Certificate
from .serializers import CertificateSerializer


class CertificateListView(generics.ListAPIView):
    serializer_class = CertificateSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Certificate.objects.filter(student=self.request.user).select_related("course", "enrollment")


class CertificateDetailView(generics.RetrieveAPIView):
    serializer_class = CertificateSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Certificate.objects.filter(student=self.request.user).select_related("course", "enrollment")


class CertificateVerifyView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, certificate_id):
        certificate = get_object_or_404(
            Certificate.objects.select_related("student", "course", "enrollment"),
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
        enrollment = get_object_or_404(
            Enrollment.objects.select_related("course").prefetch_related(
                Prefetch("course__sections", queryset=Section.objects.prefetch_related("lessons")),
                "progress",
            ),
            course_id=course_pk,
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
                    "course": enrollment.course,
                    "progress_percentage": str(enrollment.get_progress_percentage()),
                },
            )
        except ValidationError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        if not created:
            serializer = CertificateSerializer(certificate, context={"request": request})
            return Response({"detail": "Certificate already issued.", "certificate": serializer.data}, status=status.HTTP_200_OK)

        serializer = CertificateSerializer(certificate, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

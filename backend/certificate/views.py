from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from enrollment.models import Enrollment
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


class IssueCertificateView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, course_pk):
        enrollment = get_object_or_404(Enrollment, course_id=course_pk, student=request.user)

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
            return Response(
                {"detail": "Certificate already issued.", "certificate_code": certificate.certificate_code},
                status=status.HTTP_200_OK,
            )

        serializer = CertificateSerializer(certificate)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

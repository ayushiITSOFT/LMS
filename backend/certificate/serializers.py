from rest_framework import serializers
from django.urls import reverse

from .models import Certificate


class CertificateSerializer(serializers.ModelSerializer):
    verification_url = serializers.SerializerMethodField()
    qr_code_value = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = (
            "id",
            "student",
            "course",
            "enrollment",
            "certificate_id",
            "certificate_code",
            "verification_url",
            "qr_code_value",
            "progress_percentage",
            "issued_at",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "student",
            "course",
            "enrollment",
            "certificate_id",
            "certificate_code",
            "verification_url",
            "qr_code_value",
            "progress_percentage",
            "issued_at",
            "created_at",
            "updated_at",
        )

    def get_verification_url(self, certificate):
        path = reverse("certificate:certificate-verify", kwargs={"certificate_id": certificate.certificate_id})
        request = self.context.get("request")
        return request.build_absolute_uri(path) if request else path

    def get_qr_code_value(self, certificate):
        return self.get_verification_url(certificate)

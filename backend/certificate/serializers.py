from rest_framework import serializers

from .models import Certificate


class CertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certificate
        fields = (
            "id",
            "student",
            "course",
            "enrollment",
            "certificate_code",
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
            "certificate_code",
            "progress_percentage",
            "issued_at",
            "created_at",
            "updated_at",
        )

from rest_framework import serializers
from django.urls import reverse

from .models import Certificate


class CertificateSerializer(serializers.ModelSerializer):
    verification_url = serializers.SerializerMethodField()
    qr_code_value = serializers.SerializerMethodField()
    student_name = serializers.SerializerMethodField()
    student_email = serializers.ReadOnlyField(source="student.email")
    course_title = serializers.ReadOnlyField(source="course.title")
    instructor_name = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = (
            "id",
            "student",
            "student_name",
            "student_email",
            "course",
            "course_title",
            "instructor_name",
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
        read_only_fields = fields

    def get_student_name(self, obj):
        name = f"{obj.student.first_name} {obj.student.last_name}".strip()
        return name or obj.student.username

    def get_instructor_name(self, obj):
        instructor = getattr(obj.course, "instructor", None)
        if instructor:
            name = f"{instructor.first_name} {instructor.last_name}".strip()
            return name or instructor.username
        return "Course Instructor"

    def get_verification_url(self, certificate):
        path = reverse("certificate:certificate-verify", kwargs={"certificate_id": certificate.certificate_id})
        request = self.context.get("request")
        return request.build_absolute_uri(path) if request else path

    def get_qr_code_value(self, certificate):
        return self.get_verification_url(certificate)

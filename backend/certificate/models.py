import uuid
from decimal import Decimal

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models

from courses.models import Course
from enrollment.models import Enrollment


class Certificate(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="certificates", on_delete=models.CASCADE)
    course = models.ForeignKey(Course, related_name="certificates", on_delete=models.CASCADE)
    enrollment = models.OneToOneField(Enrollment, related_name="certificate", on_delete=models.CASCADE)
    certificate_code = models.CharField(max_length=64, unique=True, default=uuid.uuid4().hex)
    issued_at = models.DateTimeField(auto_now_add=True)
    progress_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-issued_at",)
        constraints = [
            models.UniqueConstraint(fields=["enrollment"], name="unique_certificate_per_enrollment"),
        ]

    def __str__(self):
        return f"Certificate {self.certificate_code} for {self.student} - {self.course}"

    @classmethod
    def create_for_enrollment(cls, enrollment):
        if not enrollment.is_course_completed():
            raise ValidationError("Certificate can only be generated when course progress is 100%.")

        return cls.objects.create(
            student=enrollment.student,
            course=enrollment.course,
            enrollment=enrollment,
            progress_percentage=Decimal(str(enrollment.get_progress_percentage())),
        )

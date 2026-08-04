from django.conf import settings
from django.db import models

from courses.models import Course


class Wishlist(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="wishlists",
        on_delete=models.CASCADE,
    )
    course = models.ForeignKey(Course, related_name="wishlisted_by", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["student", "course"], name="unique_student_course_wishlist")
        ]
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.student} -> {self.course}"

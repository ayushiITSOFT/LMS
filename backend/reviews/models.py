from django.conf import settings
from django.db import models

from courses.models import Course
from enrollment.models import Enrollment


class CourseReview(models.Model):
    course = models.ForeignKey(Course, related_name="reviews", on_delete=models.CASCADE)
    enrollment = models.OneToOneField(Enrollment, related_name="course_review", on_delete=models.CASCADE)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="course_reviews", on_delete=models.CASCADE)
    rating = models.PositiveIntegerField(default=5)
    title = models.CharField(max_length=255, blank=True)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)
        constraints = [
            models.UniqueConstraint(fields=["course", "student"], name="unique_course_student_review"),
        ]

    def __str__(self):
        return f"Review by {self.student} for {self.course}"

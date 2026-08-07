from django.conf import settings
from django.db import models

from courses.models import Course


class CourseAnnouncement(models.Model):
    course = models.ForeignKey(Course, related_name="announcements", on_delete=models.CASCADE)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="course_announcements", on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_pinned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-is_pinned", "-created_at")

    def __str__(self):
        return f"{self.course.title} - {self.title}"

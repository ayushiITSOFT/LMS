from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models


class Notification(models.Model):
    class Type(models.TextChoices):
        ENROLLMENT = "enrollment", "Enrollment"
        COURSE_COMPLETION = "course_completion", "Course Completion"
        CERTIFICATE = "certificate", "Certificate Generated"
        ASSIGNMENT_DUE = "assignment_due", "Assignment Due"
        ASSIGNMENT_GRADED = "assignment_graded", "Assignment Graded"
        QUIZ_RESULT = "quiz_result", "Quiz Result"
        GENERIC = "generic", "Generic"

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="notifications", on_delete=models.CASCADE)
    actor_content_type = models.ForeignKey(ContentType, null=True, blank=True, related_name="notify_actor", on_delete=models.SET_NULL)
    actor_object_id = models.PositiveIntegerField(null=True, blank=True)
    actor = GenericForeignKey("actor_content_type", "actor_object_id")

    verb = models.CharField(max_length=128, choices=Type.choices, default=Type.GENERIC)

    # Generic relation to target (course, assignment, certificate, quiz attempt, etc.)
    target_content_type = models.ForeignKey(ContentType, null=True, blank=True, related_name="notify_target", on_delete=models.SET_NULL)
    target_object_id = models.PositiveIntegerField(null=True, blank=True)
    target = GenericForeignKey("target_content_type", "target_object_id")

    data = models.JSONField(null=True, blank=True)

    read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-timestamp",)

    def mark_read(self):
        if not self.read:
            self.read = True
            self.save(update_fields=("read",))

    def __str__(self):
        return f"Notification to {self.recipient} - {self.verb} @ {self.timestamp}"

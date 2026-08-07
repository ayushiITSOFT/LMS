from django.conf import settings
from django.db import models


class AuditLog(models.Model):
    class Action(models.TextChoices):
        DELETE = "delete", "Delete"
        UPDATE = "update", "Update"
        PUBLISH = "publish", "Publish"
        APPROVE = "approve", "Approve"
        REJECT = "reject", "Reject"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="audit_logs", on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    action = models.CharField(max_length=20, choices=Action.choices)
    object = models.CharField(max_length=255)
    previous_value = models.JSONField(null=True, blank=True)
    new_value = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ("-timestamp",)

    def __str__(self):
        return f"{self.user} {self.action} {self.object}"

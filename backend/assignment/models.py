from django.conf import settings
from django.db import models

from courses.models import Course, Lesson


class Assignment(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"

    class AttachmentType(models.TextChoices):
        TEXT = "text", "Text / Instructions"
        PDF = "pdf", "PDF Document"
        VIDEO = "video", "Video Lesson / Link"

    course = models.ForeignKey(Course, related_name="assignments", on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, related_name="assignments", on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    instructions = models.TextField(blank=True)
    attachment_type = models.CharField(max_length=20, choices=AttachmentType.choices, default=AttachmentType.TEXT)
    pdf_file = models.FileField(upload_to="assignments/pdfs/", null=True, blank=True)
    video_url = models.CharField(max_length=500, blank=True, default="")
    due_date = models.DateTimeField(null=True, blank=True)
    max_score = models.PositiveIntegerField(default=100)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PUBLISHED)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("due_date", "created_at")

    def __str__(self):
        return self.title


class AssignmentSubmission(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SUBMITTED = "submitted", "Submitted"
        GRADED = "graded", "Graded"

    assignment = models.ForeignKey(Assignment, related_name="submissions", on_delete=models.CASCADE)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="assignment_submissions", on_delete=models.CASCADE)
    content = models.TextField(blank=True)
    file = models.FileField(upload_to="assignments/submissions/", null=True, blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    score = models.PositiveIntegerField(default=0)
    feedback = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["assignment", "student"], name="unique_assignment_student_submission")
        ]
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.student} -> {self.assignment}"

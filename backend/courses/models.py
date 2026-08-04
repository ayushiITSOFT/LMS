from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models


class Course(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"
        ARCHIVED = "archived", "Archived"

    class Level(models.TextChoices):
        BEGINNER = "beginner", "Beginner"
        INTERMEDIATE = "intermediate", "Intermediate"
        ADVANCED = "advanced", "Advanced"

    category = models.CharField(max_length=100)
    title = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    thumbnail = models.ImageField(upload_to="course_thumbnails/", null=True, blank=True)
    level = models.CharField(max_length=20, choices=Level.choices, default=Level.BEGINNER)
    language = models.CharField(max_length=50, default="English")
    price = models.DecimalField(
        max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)]
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)

    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="courses", on_delete=models.CASCADE
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)

    def get_publish_validation_errors(self):
        errors = {}

        if not self.title or not self.title.strip():
            errors["title"] = ["Title is required."]

        if not self.category or not self.category.strip():
            errors["category"] = ["Category is required."]

        if not self.sections.exists():
            errors["sections"] = ["At least one section is required."]

        if not Lesson.objects.filter(section__course=self).exists():
            errors["lessons"] = ["At least one lesson is required."]

        return errors

    def is_publishable(self):
        return not self.get_publish_validation_errors()

    def publish(self):
        if self.status == self.Status.PUBLISHED:
            return self

        errors = self.get_publish_validation_errors()
        if errors:
            raise ValidationError(errors)

        self.status = self.Status.PUBLISHED
        self.save(update_fields=("status", "updated_at"))
        return self

    def __str__(self):
        return self.title


class Section(models.Model):
    course = models.ForeignKey(Course, related_name="sections", on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("order",)
        unique_together = ("course", "order")

    def save(self, *args, **kwargs):
        # Auto-assign order if not provided (0)
        if (not self.order or self.order == 0) and self.course_id:
            max_order = (
                Section.objects.filter(course_id=self.course_id)
                .aggregate(models.Max("order"))
                .get("order__max")
                or 0
            )
            self.order = max_order + 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Lesson(models.Model):
    class Kind(models.TextChoices):
        VIDEO = "video", "Video"
        PDF = "pdf", "PDF"
        NOTES = "notes", "Notes"

    section = models.ForeignKey(Section, related_name="lessons", on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    kind = models.CharField(max_length=20, choices=Kind.choices, default=Kind.VIDEO)

    # Content fields (optional depending on kind)
    video_url = models.URLField(blank=True, null=True)
    pdf = models.FileField(upload_to="lessons/pdfs/", blank=True, null=True)
    notes = models.TextField(blank=True)
    preview = models.BooleanField(default=False)

    order = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("order",)
        unique_together = ("section", "order")

    def save(self, *args, **kwargs):
        # Auto-assign order within section if not provided (0)
        if (not self.order or self.order == 0) and self.section_id:
            max_order = (
                Lesson.objects.filter(section_id=self.section_id)
                .aggregate(models.Max("order"))
                .get("order__max")
                or 0
            )
            self.order = max_order + 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.section.course.title} - {self.section.title} - {self.title}"

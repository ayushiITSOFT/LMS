from django.conf import settings
import django.db.models.deletion
from django.db import migrations, models


def generate_sql(apps, schema_editor):
    return None


class Migration(migrations.Migration):
    initial = True
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Assignment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True)),
                ("instructions", models.TextField(blank=True)),
                ("due_date", models.DateTimeField(blank=True, null=True)),
                ("max_score", models.PositiveIntegerField(default=100)),
                ("status", models.CharField(choices=[("draft", "Draft"), ("published", "Published")], default="draft", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("course", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="assignments", to="courses.course")),
                ("lesson", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="assignments", to="courses.lesson")),
            ],
            options={"ordering": ("due_date", "created_at")},
        ),
        migrations.CreateModel(
            name="AssignmentSubmission",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("content", models.TextField(blank=True)),
                ("submitted_at", models.DateTimeField(blank=True, null=True)),
                ("score", models.PositiveIntegerField(default=0)),
                ("feedback", models.TextField(blank=True)),
                ("status", models.CharField(choices=[("draft", "Draft"), ("submitted", "Submitted"), ("graded", "Graded")], default="draft", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("assignment", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="submissions", to="assignment.assignment")),
                ("student", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="assignment_submissions", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ("-created_at",)},
        ),
        migrations.AddConstraint(
            model_name="assignmentsubmission",
            constraint=models.UniqueConstraint(fields=("assignment", "student"), name="unique_assignment_student_submission"),
        ),
    ]

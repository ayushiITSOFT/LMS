from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
    migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ("courses", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="CourseAnnouncement",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("message", models.TextField()),
                ("is_pinned", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("course", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="announcements", to="courses.course")),
                ("created_by", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="course_announcements", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ("-is_pinned", "-created_at"),
            },
        ),
    ]

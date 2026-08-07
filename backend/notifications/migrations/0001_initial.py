from django.conf import settings
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("contenttypes", "0002_remove_content_type_name"),
    ]

    operations = [
        migrations.CreateModel(
            name="Notification",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("actor_object_id", models.PositiveIntegerField(blank=True, null=True)),
                ("verb", models.CharField(choices=[("enrollment", "Enrollment"), ("course_completion", "Course Completion"), ("certificate", "Certificate Generated"), ("assignment_due", "Assignment Due"), ("assignment_graded", "Assignment Graded"), ("quiz_result", "Quiz Result"), ("generic", "Generic")], default="generic", max_length=128)),
                ("target_object_id", models.PositiveIntegerField(blank=True, null=True)),
                ("data", models.JSONField(blank=True, null=True)),
                ("read", models.BooleanField(default=False)),
                ("timestamp", models.DateTimeField(auto_now_add=True)),
                ("recipient", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="notifications", to=settings.AUTH_USER_MODEL)),
                ("actor_content_type", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="notify_actor", to="contenttypes.contenttype")),
                ("target_content_type", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="notify_target", to="contenttypes.contenttype")),
            ],
            options={"ordering": ("-timestamp",)},
        ),
    ]

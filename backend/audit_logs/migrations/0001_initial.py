from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="AuditLog",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("timestamp", models.DateTimeField(auto_now_add=True)),
                ("action", models.CharField(choices=[("delete", "Delete"), ("update", "Update"), ("publish", "Publish"), ("approve", "Approve"), ("reject", "Reject")], max_length=20)),
                ("object", models.CharField(max_length=255)),
                ("previous_value", models.JSONField(blank=True, null=True)),
                ("new_value", models.JSONField(blank=True, null=True)),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="audit_logs", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ("-timestamp",),
            },
        ),
    ]

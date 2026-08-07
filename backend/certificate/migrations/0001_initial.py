from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion

import certificate.models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Certificate",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("certificate_code", models.CharField(default=certificate.models.certificate_code, max_length=64, unique=True)),
                ("certificate_id", models.CharField(default=certificate.models.certificate_id, editable=False, max_length=32, unique=True)),
                ("issued_at", models.DateTimeField(auto_now_add=True)),
                ("progress_percentage", models.DecimalField(decimal_places=2, max_digits=5)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("course", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="certificates", to="courses.course")),
                ("enrollment", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="certificate", to="enrollment.enrollment")),
                ("student", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="certificates", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ("-issued_at",),
            },
        ),
        migrations.AddConstraint(
            model_name="certificate",
            constraint=models.UniqueConstraint(fields=("enrollment",), name="unique_certificate_per_enrollment"),
        ),
    ]

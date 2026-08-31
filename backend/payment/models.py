from decimal import Decimal
import uuid

from django.conf import settings
from django.db import models

from orders.models import Order


class Payment(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"

    order = models.OneToOneField(Order, related_name="payment", on_delete=models.CASCADE)
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="payments",
        on_delete=models.CASCADE,
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    transaction_id = models.CharField(max_length=100, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.transaction_id:
            self.transaction_id = f"txn_{uuid.uuid4().hex[:12]}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Payment {self.id} for order {self.order_id}"

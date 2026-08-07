from rest_framework import serializers

from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source="user.username")

    class Meta:
        model = AuditLog
        fields = ("id", "user", "user_name", "timestamp", "action", "object", "previous_value", "new_value")
        read_only_fields = fields

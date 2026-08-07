from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    actor = serializers.SerializerMethodField(read_only=True)
    target = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Notification
        fields = (
            "id",
            "recipient",
            "verb",
            "actor",
            "target",
            "data",
            "read",
            "timestamp",
        )
        read_only_fields = ("id", "recipient", "actor", "target", "timestamp")

    def get_actor(self, obj):
        try:
            if obj.actor is None:
                return None
            return {"type": obj.actor_content_type.model, "id": obj.actor_object_id}
        except Exception:
            return None

    def get_target(self, obj):
        try:
            if obj.target is None:
                return None
            return {"type": obj.target_content_type.model, "id": obj.target_object_id}
        except Exception:
            return None

from rest_framework import generics, permissions

from accounts.permissions import IsAdminRole
from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogListView(generics.ListAPIView):
    serializer_class = AuditLogSerializer
    permission_classes = (permissions.IsAuthenticated, IsAdminRole)

    def get_queryset(self):
        return AuditLog.objects.select_related("user").only(
            "id",
            "user",
            "user__username",
            "timestamp",
            "action",
            "object",
            "previous_value",
            "new_value",
        )

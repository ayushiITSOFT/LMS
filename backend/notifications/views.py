from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """List and retrieve notifications for the authenticated user. """

    serializer_class = NotificationSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user).select_related(
            "actor_content_type",
            "target_content_type",
        )

    @action(detail=True, methods=("post",), url_path="mark-read")
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.mark_read()
        return Response({"detail": "Marked as read."}, status=status.HTTP_200_OK)

    @action(detail=False, methods=("post",), url_path="mark-all-read")
    def mark_all_read(self, request):
        qs = self.get_queryset().filter(read=False)
        qs.update(read=True)
        return Response({"detail": "All notifications marked as read."}, status=status.HTTP_200_OK)

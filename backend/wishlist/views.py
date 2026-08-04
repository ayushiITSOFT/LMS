from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from courses.models import Course
from .models import Wishlist
from .serializers import WishlistSerializer
from accounts.permissions import is_student


class WishlistListCreateView(generics.ListCreateAPIView):
    serializer_class = WishlistSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if not is_student(self.request.user):
            return Wishlist.objects.none()
        return Wishlist.objects.filter(student=self.request.user).select_related("course")

    def perform_create(self, serializer):
        if not is_student(self.request.user):
            self.permission_denied(self.request, message="Only students can manage wishlist")
        serializer.save(student=self.request.user)


class WishlistDeleteView(generics.DestroyAPIView):
    serializer_class = WishlistSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if not is_student(self.request.user):
            return Wishlist.objects.none()
        return Wishlist.objects.filter(student=self.request.user)

    def delete(self, request, *args, **kwargs):
        course = get_object_or_404(Course, pk=kwargs.get("course_pk"))
        wishlist_item = get_object_or_404(
            self.get_queryset(), course=course
        )
        self.check_object_permissions(request, wishlist_item)
        wishlist_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

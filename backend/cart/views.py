from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from courses.models import Course
from .models import CartItem
from .serializers import CartItemSerializer
from accounts.permissions import is_student


class CartItemListCreateView(generics.ListCreateAPIView):
    serializer_class = CartItemSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if not is_student(self.request.user):
            return CartItem.objects.none()
        return CartItem.objects.filter(student=self.request.user).select_related("course")

    def perform_create(self, serializer):
        if not is_student(self.request.user):
            self.permission_denied(self.request, message="Only students can manage cart")
        serializer.save(student=self.request.user)


class CartItemDeleteView(generics.DestroyAPIView):
    serializer_class = CartItemSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if not is_student(self.request.user):
            return CartItem.objects.none()
        return CartItem.objects.filter(student=self.request.user)

    def delete(self, request, *args, **kwargs):
        course = get_object_or_404(Course, pk=kwargs.get("course_pk"))
        cart_item = get_object_or_404(self.get_queryset(), course=course)
        self.check_object_permissions(request, cart_item)
        cart_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

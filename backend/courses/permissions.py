from rest_framework import permissions

from accounts.permissions import is_admin, is_instructor, is_student


class CanPreviewCourse(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if is_admin(request.user) or is_instructor(request.user):
            return True

        if not is_student(request.user):
            return False

        # Students can preview only if the target lesson is marked preview
        # or if the course contains preview lessons.
        if hasattr(obj, "preview"):
            return bool(obj.preview)

        if hasattr(obj, "sections"):
            return obj.sections.filter(lessons__preview=True).exists()

        if hasattr(obj, "section") and hasattr(obj.section, "course"):
            return bool(getattr(obj, "preview", False))

        return False

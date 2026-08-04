from rest_framework import permissions


ADMIN = "admin"
INSTRUCTOR = "instructor"
STUDENT = "student"


def has_role(user, role):
    return bool(user and user.is_authenticated and user.role == role)


def is_admin(user):
    return bool(user and user.is_authenticated and (user.is_staff or user.role == ADMIN))


def is_instructor(user):
    return has_role(user, INSTRUCTOR)


def is_student(user):
    return has_role(user, STUDENT)


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return is_admin(request.user)


class IsInstructorRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return is_admin(request.user) or is_instructor(request.user)


class IsStudentRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return is_admin(request.user) or is_student(request.user)


class CanCreateCourse(permissions.BasePermission):
    def has_permission(self, request, view):
        return is_admin(request.user) or is_instructor(request.user)


class CanManageOwnCourse(permissions.BasePermission):
    def has_permission(self, request, view):
        return is_admin(request.user) or is_instructor(request.user)

    def has_object_permission(self, request, view, obj):
        if is_admin(request.user):
            return True

        # TODO: Confirm Course owner field name when Course model is implemented.
        owner = getattr(obj, "instructor", None) or getattr(obj, "owner", None)
        return is_instructor(request.user) and owner == request.user


class CanEditOwnCourse(CanManageOwnCourse):
    pass


class CanDeleteOwnCourse(CanManageOwnCourse):
    pass


class CanBrowseCourses(permissions.BasePermission):
    def has_permission(self, request, view):
        return is_admin(request.user) or is_student(request.user)


class CanBuyCourse(permissions.BasePermission):
    def has_permission(self, request, view):
        return is_admin(request.user) or is_student(request.user)


class CanAccessPurchasedCourse(permissions.BasePermission):
    def has_permission(self, request, view):
        return is_admin(request.user) or is_student(request.user)

    def has_object_permission(self, request, view, obj):
        if is_admin(request.user):
            return True

        # TODO: Replace with Enrollment/Purchase lookup when those models exist.
        student = getattr(obj, "student", None) or getattr(obj, "user", None)
        return is_student(request.user) and student == request.user

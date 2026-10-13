from django.urls import path

from .views import (
    AdminDashboardView,
    LoginView,
    LogoutView,
    RefreshTokenView,
    RegisterView,
    UserAdminDetailView,
    UserAdminListView,
)


app_name = "accounts"

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("refresh/", RefreshTokenView.as_view(), name="refresh"),
    path("admin/dashboard/", AdminDashboardView.as_view(), name="admin-dashboard"),
    path("admin/users/", UserAdminListView.as_view(), name="admin-user-list"),
    path("admin/users/<int:pk>/", UserAdminDetailView.as_view(), name="admin-user-detail"),
]

from django.urls import path

from .views import AdminDashboardView, LoginView, LogoutView, RefreshTokenView, RegisterView


app_name = "accounts"

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("refresh/", RefreshTokenView.as_view(), name="refresh"),
    path("admin/dashboard/", AdminDashboardView.as_view(), name="admin-dashboard"),
]

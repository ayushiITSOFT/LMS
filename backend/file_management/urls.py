from django.urls import path

from .views import FileUploadView


app_name = "file_management"

urlpatterns = [
    path("upload/", FileUploadView.as_view(), name="upload"),
]

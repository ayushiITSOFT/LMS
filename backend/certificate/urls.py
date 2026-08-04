from django.urls import path

from .views import CertificateDetailView, CertificateListView, IssueCertificateView

app_name = "certificate"

urlpatterns = [
    path("", CertificateListView.as_view(), name="certificate-list"),
    path("courses/<int:course_pk>/issue/", IssueCertificateView.as_view(), name="certificate-issue"),
    path("<int:pk>/", CertificateDetailView.as_view(), name="certificate-detail"),
]

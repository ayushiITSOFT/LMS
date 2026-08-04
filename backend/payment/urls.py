from django.urls import path

from .views import PaymentProcessView

app_name = "payment"

urlpatterns = [
    path("", PaymentProcessView.as_view(), name="process"),
]

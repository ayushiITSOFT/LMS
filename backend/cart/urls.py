from django.urls import path

from .views import CartItemDeleteView, CartItemListCreateView

app_name = "cart"

urlpatterns = [
    path("", CartItemListCreateView.as_view(), name="list-create"),
    path("<int:course_pk>/", CartItemDeleteView.as_view(), name="delete"),
]

from django.urls import path

from .views import WishlistDeleteView, WishlistListCreateView

app_name = "wishlist"

urlpatterns = [
    path("", WishlistListCreateView.as_view(), name="list-create"),
    path("<int:course_pk>/", WishlistDeleteView.as_view(), name="delete"),
]

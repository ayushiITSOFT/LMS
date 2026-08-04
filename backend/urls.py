from django.urls import include, path

urlpatterns = [
    path("accounts/", include(("accounts.urls", "accounts"), namespace="accounts")),
    path("courses/", include(("courses.urls", "courses"), namespace="courses")),
    path("wishlist/", include(("wishlist.urls", "wishlist"), namespace="wishlist")),
    path("cart/", include(("cart.urls", "cart"), namespace="cart")),
    path("checkout/", include(("checkout.urls", "checkout"), namespace="checkout")),
    path("payment/", include(("payment.urls", "payment"), namespace="payment")),
    path("orders/", include(("orders.urls", "orders"), namespace="orders")),
    path("enrollment/", include(("enrollment.urls", "enrollment"), namespace="enrollment")),
    path("quiz/", include(("quiz.urls", "quiz"), namespace="quiz")),
    path("assignment/", include(("assignment.urls", "assignment"), namespace="assignment")),
    path("certificate/", include(("certificate.urls", "certificate"), namespace="certificate")),
    path("reviews/", include(("reviews.urls", "reviews"), namespace="reviews")),
]

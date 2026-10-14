from django.urls import include, path, re_path
from django.contrib import admin
from django.http import Http404
from django.views.static import serve

from django.conf import settings
from django.conf.urls.static import static

LEGACY_MEDIA_LOCATIONS = (
    ("course_thumbnails/", settings.BASE_DIR / "course_thumbnails"),
    ("lessons/videos/", settings.BASE_DIR / "lessons" / "videos"),
    ("lessons/pdfs/", settings.BASE_DIR / "lessons" / "pdfs"),
    ("assignments/pdfs/", settings.BASE_DIR / "assignments" / "pdfs"),
)


def serve_media(request, path):
    try:
        return serve(request, path, document_root=settings.MEDIA_ROOT)
    except Http404:
        for prefix, document_root in LEGACY_MEDIA_LOCATIONS:
            if path.startswith(prefix):
                return serve(request, path[len(prefix):], document_root=document_root)
        raise


urlpatterns = [
    path("admin/", admin.site.urls),
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
    path("notifications/", include(("notifications.urls", "notifications"), namespace="notifications")),
    path("analytics/", include(("analytics.urls", "analytics"), namespace="analytics")),
    path("announcements/", include(("announcements.urls", "announcements"), namespace="announcements")),
    path("files/", include(("file_management.urls", "file_management"), namespace="file_management")),
    path("audit-logs/", include(("audit_logs.urls", "audit_logs"), namespace="audit_logs")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    urlpatterns += [
        re_path(r"^media/(?P<path>.*)$", serve_media),
    ]

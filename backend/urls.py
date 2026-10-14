import mimetypes
import re

from django.urls import include, path, re_path
from django.contrib import admin
from django.core.files.storage import default_storage
from django.http import Http404, HttpResponse, StreamingHttpResponse
from django.views.static import serve
from django.utils.http import content_disposition_header

from django.conf import settings

LEGACY_MEDIA_LOCATIONS = (
    ("course_thumbnails/", settings.BASE_DIR / "course_thumbnails"),
    ("lessons/videos/", settings.BASE_DIR / "lessons" / "videos"),
    ("lessons/pdfs/", settings.BASE_DIR / "lessons" / "pdfs"),
    ("assignments/pdfs/", settings.BASE_DIR / "assignments" / "pdfs"),
)


def stored_media_response(request, path):
    size = default_storage.size(path)
    start = 0
    end = size - 1
    status_code = 200
    range_header = request.headers.get("Range", "")
    match = re.fullmatch(r"bytes=(\d*)-(\d*)", range_header.strip())

    if match and size:
        range_start, range_end = match.groups()
        if range_start:
            start = int(range_start)
            end = int(range_end) if range_end else end
        elif range_end:
            suffix_length = int(range_end)
            start = max(0, size - suffix_length)
        else:
            match = None

        if match:
            if start >= size or end < start:
                response = HttpResponse(status=416)
                response["Content-Range"] = f"bytes */{size}"
                response["Accept-Ranges"] = "bytes"
                return response
            end = min(end, size - 1)
            status_code = 206

    content_type = getattr(default_storage, "get_content_type", lambda _: None)(path)
    if not content_type:
        content_type = mimetypes.guess_type(path)[0] or "application/octet-stream"

    if request.method == "HEAD":
        response = HttpResponse(status=status_code, content_type=content_type)
    else:
        media_file = default_storage.open(path, "rb")
        media_file.seek(start)

        def stream_file():
            remaining = end - start + 1
            try:
                while remaining:
                    chunk = media_file.read(min(64 * 1024, remaining))
                    if not chunk:
                        break
                    remaining -= len(chunk)
                    yield chunk
            finally:
                media_file.close()

        response = StreamingHttpResponse(
            stream_file(),
            status=status_code,
            content_type=content_type,
        )

    response["Content-Length"] = max(0, end - start + 1)
    response["Accept-Ranges"] = "bytes"
    response["Content-Disposition"] = content_disposition_header(
        False,
        path.rsplit("/", 1)[-1],
    )
    response["X-Content-Type-Options"] = "nosniff"
    if status_code == 206:
        response["Content-Range"] = f"bytes {start}-{end}/{size}"
    return response


def serve_media(request, path):
    if request.method not in ("GET", "HEAD"):
        return HttpResponse(status=405, headers={"Allow": "GET, HEAD"})

    if default_storage.exists(path):
        return stored_media_response(request, path)

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

urlpatterns += [
    re_path(r"^media/(?P<path>.*)$", serve_media),
]

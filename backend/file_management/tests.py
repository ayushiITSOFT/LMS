from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import RequestFactory, TestCase, override_settings
from django.core.files.storage import default_storage

from urls import serve_media
from .database_storage import DatabaseMediaStorage


DATABASE_STORAGES = {
    "default": {
        "BACKEND": "file_management.database_storage.DatabaseMediaStorage",
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}


@override_settings(STORAGES=DATABASE_STORAGES, MEDIA_URL="/media/")
class DatabaseMediaStorageTests(TestCase):
    def setUp(self):
        self.storage = DatabaseMediaStorage()

    def test_stores_and_reads_file_chunks(self):
        content = b"course media" * 100_000
        name = self.storage.save(
            "lessons/videos/example.mp4",
            SimpleUploadedFile("example.mp4", content, content_type="video/mp4"),
        )

        with self.storage.open(name) as stored:
            self.assertEqual(stored.read(17), content[:17])
            stored.seek(99_990)
            self.assertEqual(stored.read(31), content[99_990:100_021])
            stored.seek(1024 * 1024 - 5)
            self.assertEqual(stored.read(17), content[1024 * 1024 - 5:1024 * 1024 + 12])

        self.assertEqual(self.storage.size(name), len(content))
        self.assertEqual(self.storage.get_content_type(name), "video/mp4")

        self.storage.delete(name)
        self.assertFalse(self.storage.exists(name))

    def test_media_endpoint_supports_video_byte_ranges(self):
        content = b"0123456789"
        name = default_storage.save(
            "lessons/videos/range.mp4",
            SimpleUploadedFile("range.mp4", content, content_type="video/mp4"),
        )
        request = RequestFactory().get(
            f"/media/{name}",
            HTTP_RANGE="bytes=3-6",
        )

        response = serve_media(request, name)

        self.assertEqual(response.status_code, 206)
        self.assertEqual(b"".join(response.streaming_content), b"3456")
        self.assertEqual(response["Content-Range"], "bytes 3-6/10")
        self.assertEqual(response["Accept-Ranges"], "bytes")

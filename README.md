# Learning-Management-System-

## Upload storage with Neon

When `DATABASE_URL` is configured, Django stores uploaded thumbnails, lesson
videos and PDFs, assignment files, and file-management uploads in the database
in 1 MiB chunks. The media endpoint streams those chunks and supports byte-range
requests so video playback can seek. Without `DATABASE_URL`, uploads continue
to use Django's normal filesystem storage.

Before deploying this change to Render, ensure the start/build process applies
database migrations (`python manage.py migrate`). The `file_management`
migration creates the tables required for database-backed media.

Existing media files are not copied automatically. Re-upload files that are
already missing. Neon free-tier storage and network quotas apply to every
uploaded file; videos in particular can use that quota quickly.

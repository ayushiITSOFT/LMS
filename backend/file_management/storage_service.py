from pathlib import Path
from uuid import uuid4

from django.core.files.storage import default_storage

from .validation import validate_upload


class StorageService:
    @staticmethod
    def upload(file, file_type):
        validate_upload(file, file_type)
        extension = Path(file.name).suffix.lower()
        path = default_storage.save(f"uploads/{file_type}/{uuid4().hex}{extension}", file)
        return {
            "file_name": file.name,
            "file_type": file_type,
            "size": file.size,
            "path": path,
            "url": default_storage.url(path),
        }

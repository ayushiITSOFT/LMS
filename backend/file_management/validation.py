from pathlib import Path

from django.core.exceptions import ValidationError


MB = 1024 * 1024

FILE_RULES = {
    "video": {
        "max_size": 500 * MB,
        "extensions": {".mp4", ".mov", ".avi", ".mkv", ".webm"},
        "content_types": {"video/mp4", "video/quicktime", "video/x-msvideo", "video/x-matroska", "video/webm"},
    },
    "pdf": {
        "max_size": 25 * MB,
        "extensions": {".pdf"},
        "content_types": {"application/pdf"},
    },
    "image": {
        "max_size": 10 * MB,
        "extensions": {".jpg", ".jpeg", ".png", ".gif", ".webp"},
        "content_types": {"image/jpeg", "image/png", "image/gif", "image/webp"},
    },
    "zip": {
        "max_size": 100 * MB,
        "extensions": {".zip"},
        "content_types": {"application/zip", "application/x-zip-compressed"},
    },
}


def infer_file_type(file_name):
    if not file_name:
        return None
    extension = Path(file_name).suffix.lower()
    for file_type, rules in FILE_RULES.items():
        if extension in rules["extensions"]:
            return file_type
    return None


def validate_upload(file, file_type):
    rules = FILE_RULES.get(file_type)
    if not rules:
        raise ValidationError(f"Unsupported file type '{file_type}'.")

    extension = Path(file.name).suffix.lower()
    if extension not in rules["extensions"]:
        raise ValidationError(f"{file_type} uploads must use: {', '.join(sorted(rules['extensions']))}.")

    content_type = getattr(file, "content_type", "")
    if content_type and content_type not in rules["content_types"]:
        raise ValidationError(f"Invalid content type '{content_type}' for {file_type} upload.")

    if file.size > rules["max_size"]:
        max_mb = rules["max_size"] // MB
        raise ValidationError(f"{file_type} uploads must be {max_mb}MB or smaller.")

    return file

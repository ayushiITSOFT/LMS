from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .storage_service import StorageService
from .validation import FILE_RULES, infer_file_type, validate_upload


class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    file_type = serializers.ChoiceField(
        choices=tuple((key, key) for key in FILE_RULES),
        required=False,
    )

    def validate(self, attrs):
        file = attrs.get("file")
        file_type = attrs.get("file_type")

        if not file_type and file:
            inferred = infer_file_type(file.name)
            if not inferred:
                allowed_extensions = ", ".join(sorted(ext for r in FILE_RULES.values() for ext in r["extensions"]))
                raise serializers.ValidationError({
                    "file_type": f"Could not determine file type from filename '{file.name}'. Supported extensions: {allowed_extensions}."
                })
            file_type = inferred
            attrs["file_type"] = file_type

        try:
            validate_upload(attrs["file"], attrs["file_type"])
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"file": exc.messages})
        return attrs

    def save(self, **kwargs):
        return StorageService.upload(self.validated_data["file"], self.validated_data["file_type"])

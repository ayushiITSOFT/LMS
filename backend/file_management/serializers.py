from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .storage_service import StorageService
from .validation import FILE_RULES, validate_upload


class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    file_type = serializers.ChoiceField(choices=tuple((key, key) for key in FILE_RULES))

    def validate(self, attrs):
        try:
            validate_upload(attrs["file"], attrs["file_type"])
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"file": exc.messages})
        return attrs

    def save(self, **kwargs):
        return StorageService.upload(self.validated_data["file"], self.validated_data["file_type"])

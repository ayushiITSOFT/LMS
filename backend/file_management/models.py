from django.db import models


class StoredFile(models.Model):
    storage_key = models.CharField(max_length=512, unique=True)
    content_type = models.CharField(max_length=255, blank=True)
    size = models.BigIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("storage_key",)


class StoredFileChunk(models.Model):
    stored_file = models.ForeignKey(
        StoredFile,
        related_name="chunks",
        on_delete=models.CASCADE,
    )
    chunk_index = models.PositiveIntegerField()
    data = models.BinaryField()

    class Meta:
        ordering = ("chunk_index",)
        constraints = [
            models.UniqueConstraint(
                fields=("stored_file", "chunk_index"),
                name="unique_stored_file_chunk",
            ),
        ]

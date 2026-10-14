import mimetypes
import os
from urllib.parse import quote

from django.conf import settings
from django.core.files import File
from django.core.files.storage import Storage
from django.utils import timezone

from .models import StoredFile, StoredFileChunk


CHUNK_SIZE = 1024 * 1024
SAVE_BATCH_SIZE = 8


class DatabaseFileStream:
    def __init__(self, stored_file):
        self.name = stored_file.storage_key
        self.size = stored_file.size
        self.position = 0
        self._chunk_index = None
        self._chunk_data = None
        self.closed = False

    def readable(self):
        return True

    def seekable(self):
        return True

    def tell(self):
        return self.position

    def seek(self, offset, whence=os.SEEK_SET):
        if whence == os.SEEK_SET:
            position = offset
        elif whence == os.SEEK_CUR:
            position = self.position + offset
        elif whence == os.SEEK_END:
            position = self.size + offset
        else:
            raise ValueError(f"Invalid whence ({whence}); expected 0, 1, or 2.")

        if position < 0:
            raise ValueError("Negative seek position.")
        self.position = position
        return position

    def read(self, size=-1):
        if self.closed:
            raise ValueError("I/O operation on closed file.")
        if size is None or size < 0:
            size = max(0, self.size - self.position)
        size = min(size, max(0, self.size - self.position))
        result = bytearray()

        while size:
            chunk_index, chunk_offset = divmod(self.position, CHUNK_SIZE)
            if self._chunk_index != chunk_index:
                try:
                    self._chunk_data = bytes(
                        StoredFileChunk.objects.values_list("data", flat=True).get(
                            stored_file__storage_key=self.name,
                            chunk_index=chunk_index,
                        )
                    )
                except StoredFileChunk.DoesNotExist as exc:
                    raise OSError(f"Missing media chunk {chunk_index} for {self.name}.") from exc
                self._chunk_index = chunk_index

            available = min(size, len(self._chunk_data) - chunk_offset)
            if available <= 0:
                raise OSError(f"Invalid media chunk {chunk_index} for {self.name}.")
            result.extend(self._chunk_data[chunk_offset:chunk_offset + available])
            self.position += available
            size -= available

        return bytes(result)

    def close(self):
        self.closed = True
        self._chunk_data = None


class DatabaseMediaStorage(Storage):
    def _open(self, name, mode="rb"):
        if mode != "rb":
            raise ValueError("Database media files can only be opened in binary read mode.")
        try:
            stored_file = StoredFile.objects.get(storage_key=name)
        except StoredFile.DoesNotExist as exc:
            raise FileNotFoundError(name) from exc
        return File(DatabaseFileStream(stored_file), name=name)

    def _save(self, name, content):
        stored_file = StoredFile.objects.create(
            storage_key=name,
            content_type=getattr(content, "content_type", "") or "",
        )
        chunk_index = 0
        total_size = 0
        buffered = bytearray()
        pending_chunks = []

        try:
            for incoming_chunk in content.chunks():
                buffered.extend(incoming_chunk)
                while len(buffered) >= CHUNK_SIZE:
                    pending_chunks.append(
                        StoredFileChunk(
                            stored_file=stored_file,
                            chunk_index=chunk_index,
                            data=bytes(buffered[:CHUNK_SIZE]),
                        )
                    )
                    del buffered[:CHUNK_SIZE]
                    total_size += CHUNK_SIZE
                    chunk_index += 1

                    if len(pending_chunks) >= SAVE_BATCH_SIZE:
                        StoredFileChunk.objects.bulk_create(pending_chunks)
                        pending_chunks.clear()

            if buffered:
                pending_chunks.append(
                    StoredFileChunk(
                        stored_file=stored_file,
                        chunk_index=chunk_index,
                        data=bytes(buffered),
                    )
                )
                total_size += len(buffered)

            if pending_chunks:
                StoredFileChunk.objects.bulk_create(pending_chunks)
            StoredFile.objects.filter(pk=stored_file.pk).update(size=total_size)
        except Exception:
            stored_file.delete()
            raise

        return name

    def delete(self, name):
        StoredFile.objects.filter(storage_key=name).delete()

    def exists(self, name):
        return StoredFile.objects.filter(storage_key=name).exists()

    def size(self, name):
        try:
            return StoredFile.objects.values_list("size", flat=True).get(storage_key=name)
        except StoredFile.DoesNotExist as exc:
            raise FileNotFoundError(name) from exc

    def get_modified_time(self, name):
        try:
            value = StoredFile.objects.values_list("created_at", flat=True).get(storage_key=name)
        except StoredFile.DoesNotExist as exc:
            raise FileNotFoundError(name) from exc
        if settings.USE_TZ and timezone.is_naive(value):
            return timezone.make_aware(value, timezone.get_current_timezone())
        return value

    def get_accessed_time(self, name):
        return self.get_modified_time(name)

    def get_created_time(self, name):
        return self.get_modified_time(name)

    def url(self, name):
        return f"{settings.MEDIA_URL.rstrip('/')}/{quote(name, safe='/')}"

    def listdir(self, path):
        prefix = f"{path.rstrip('/')}/" if path else ""
        names = StoredFile.objects.filter(storage_key__startswith=prefix).values_list(
            "storage_key",
            flat=True,
        )
        directories = set()
        files = []

        for name in names:
            remainder = name[len(prefix):]
            first_part, separator, _ = remainder.partition("/")
            if separator:
                directories.add(first_part)
            else:
                files.append(first_part)

        return sorted(directories), sorted(files)

    def get_content_type(self, name):
        try:
            stored_file = StoredFile.objects.only("content_type").get(storage_key=name)
        except StoredFile.DoesNotExist as exc:
            raise FileNotFoundError(name) from exc
        return stored_file.content_type or mimetypes.guess_type(name)[0] or "application/octet-stream"

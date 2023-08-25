from cryptography.fernet import Fernet, MultiFernet
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from typing import Any, Dict, Tuple
import base64
import mimetypes

from config.env import env
from integrations.aws.client import s3_generate_presigned_post

from .enums import FileUploadStorage
from .models import File
from .utils import (
    bytes_to_mb,
    file_generate_local_upload_url,
    file_generate_name,
    file_generate_upload_path,
)


User = get_user_model()

class EncryptionService:

    def __init__(self):
        keys = env.list("ENCRYPT_KEYS")
        keys = [Fernet(base64.b64decode(key)) for key in keys]
        self.f = MultiFernet(keys)

    def encrypt(self, data: bytes) -> bytes:
        return self.f.encrypt(data)
    
    def decrypt(self, data: bytes) -> bytes:
        return self.f.decrypt(data)
    
    def generate_new_key(self) -> bytes:
        return Fernet.generate_key()


def _validate_file_size(file_obj):
    max_size = settings.FILE_MAX_SIZE

    if file_obj.size > max_size:
        raise ValidationError(f"File is too large. It should not exceed {bytes_to_mb(max_size)} MB")


class FileStandardUploadService:

    def __init__(self, user: User, file_obj):
        self.user = user
        self.file_obj = file_obj

    def _infer_file_name_and_type(self, file_name: str = "", file_type: str = "") -> Tuple[str, str]:
        if not file_name:
            file_name = self.file_obj.name

        if not file_type:
            guessed_file_type, encoding = mimetypes.guess_type(file_name)

            if guessed_file_type is None:
                file_type = ""
            else:
                file_type = guessed_file_type

        return file_name, file_type

    @transaction.atomic
    def create(self, file_name: str = "", file_type: str = "") -> File:
        _validate_file_size(self.file_obj)

        file_name, file_type = self._infer_file_name_and_type(file_name, file_type)

        obj = File(
            file=self.file_obj,
            original_file_name=file_name,
            file_name=file_generate_name(file_name),
            file_type=file_type,
            uploaded_by=self.user,
            upload_finished_at=timezone.now(),
        )

        obj.full_clean()
        obj.save()

        return obj

    @transaction.atomic
    def update(self, file: File, file_name: str = "", file_type: str = "") -> File:
        _validate_file_size(self.file_obj)

        file_name, file_type = self._infer_file_name_and_type(file_name, file_type)

        file.file = self.file_obj
        file.original_file_name = file_name
        file.file_name = file_generate_name(file_name)
        file.file_type = file_type
        file.uploaded_by = self.user
        file.upload_finished_at = timezone.now()

        file.full_clean()
        file.save()

        return file


class FileDirectUploadService:

    def __init__(self, user: User):
        self.user = user

    @transaction.atomic
    def start(self, *, file_name: str, file_type: str, api_version: str = "v1") -> Dict[str, Any]:
        file = File(
            original_file_name=file_name,
            file_name=file_generate_name(file_name),
            file_type=file_type,
            uploaded_by=self.user,
            file=None,
        )
        file.full_clean()
        file.save()

        upload_path = file_generate_upload_path(file, file.file_name)

        """
        We are doing this in order to have an associated file for the field.
        """
        file.file = file.file.field.attr_class(file, file.file.field, upload_path)
        file.save()

        presigned_data: Dict[str, Any] = {}

        if settings.FILE_UPLOAD_STORAGE == FileUploadStorage.S3:
            presigned_data = s3_generate_presigned_post(file_path=upload_path, file_type=file.file_type)

        else:
            presigned_data = {
                "url": file_generate_local_upload_url(file_id=str(file.id), api_version=api_version),
            }

        return {"id": file.id, **presigned_data}

    @transaction.atomic
    def finish(self, *, file: File) -> File:
        # Potentially, check against user
        file.upload_finished_at = timezone.now()
        file.full_clean()
        file.save()

        return file

    @transaction.atomic
    def upload_local(self, *, file: File, file_obj) -> File:
        _validate_file_size(file_obj)

        # Potentially, check against user
        file.file = file_obj
        file.full_clean()
        file.save()

        return file

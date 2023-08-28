import pathlib
from uuid import uuid4

from django.conf import settings
from django.urls import reverse


def file_generate_name(original_file_name):
    extension = pathlib.Path(original_file_name).suffix

    return f"{uuid4().hex}{extension}"


def file_generate_upload_path(instance, filename):
    return f"files/{instance.file_name}"


def file_generate_local_upload_url(*, file_id: str, api_version: str):
    url = reverse("api:files:upload:direct:local", kwargs={"file_id": file_id, "version": api_version})

    app_domain: str = settings.APP_DOMAIN  # type: ignore

    return f"{app_domain}{url}"


def bytes_to_mb(value: int) -> float:
    # 1 bytes = 1e-6 megabytes
    return value * 1e-6

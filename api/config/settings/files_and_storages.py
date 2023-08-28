import os

from config.env import BASE_DIR, env, env_to_enum
from files.enums import FileUploadStorage, FileUploadStrategy

FILE_UPLOAD_STRATEGY = env_to_enum(FileUploadStrategy, env("FILE_UPLOAD_STRATEGY", default="standard"))
FILE_UPLOAD_STORAGE = env_to_enum(FileUploadStorage, env("FILE_UPLOAD_STORAGE", default="local"))

FILE_MAX_SIZE = env.int("FILE_MAX_SIZE", default=1000000)  # 10 MB

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}

if FILE_UPLOAD_STORAGE == FileUploadStorage.LOCAL:
    MEDIA_ROOT_NAME = "media"
    MEDIA_ROOT = os.path.join(BASE_DIR, MEDIA_ROOT_NAME)
    MEDIA_URL = f"/{MEDIA_ROOT_NAME}/"

if FILE_UPLOAD_STORAGE == FileUploadStorage.S3:
    # Using django-storages
    # https://django-storages.readthedocs.io/en/latest/backends/amazon-S3.html
    # Django >= 4.2
    STORAGES["default"] = {
        "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
    }

    AWS_S3_ACCESS_KEY_ID = env.str("AWS_S3_ACCESS_KEY_ID")
    AWS_S3_SECRET_ACCESS_KEY = env.str("AWS_S3_SECRET_ACCESS_KEY")
    AWS_STORAGE_BUCKET_NAME = env.str("AWS_STORAGE_BUCKET_NAME")
    AWS_S3_REGION_NAME = env.str("AWS_S3_REGION_NAME")
    AWS_S3_SIGNATURE_VERSION = env.str("AWS_S3_SIGNATURE_VERSION", default="s3v4")

    # https://docs.aws.amazon.com/AmazonS3/latest/userguide/acl-overview.html#canned-acl
    AWS_DEFAULT_ACL = env.str("AWS_DEFAULT_ACL", default="private")

    AWS_PRESIGNED_EXPIRY = env.int("AWS_PRESIGNED_EXPIRY", default=10)  # seconds

    _AWS_S3_CUSTOM_DOMAIN = env.str("AWS_S3_CUSTOM_DOMAIN", default="")

    if _AWS_S3_CUSTOM_DOMAIN:
        AWS_S3_CUSTOM_DOMAIN = _AWS_S3_CUSTOM_DOMAIN

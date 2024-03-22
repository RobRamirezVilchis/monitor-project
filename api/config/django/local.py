from .base import *  # noqa

DEBUG = True

ALLOWED_HOSTS = ["localhost", "0.0.0.0", "127.0.0.1"]  # ["*"]

CSRF_TRUSTED_ORIGINS = ["http://localhost:3000"]

AUTH_PASSWORD_VALIDATORS = []


DATABASES["default"] = {
    "ENGINE": "django.db.backends.postgresql_psycopg2",
    "NAME": "dbmonitor",
    "USER": "rob",
    "PASSWORD": "150325",
    "HOST": "localhost",
    "PORT": "5432",
}

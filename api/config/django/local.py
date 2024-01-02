from .base import * # noqa

DEBUG = True

ALLOWED_HOSTS = ["localhost", "0.0.0.0", "127.0.0.1"] # ["*"]

CSRF_TRUSTED_ORIGINS = ["http://localhost:3000"]

AUTH_PASSWORD_VALIDATORS = []

DATABASES["default"] = {
    "ENGINE": "django.db.backends.sqlite3",
    "NAME": os.path.join(BASE_DIR, "db.sqlite3"),
    "OPTIONS": {
        "timeout": 20,
    },
}


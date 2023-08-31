from django.apps import AppConfig
from django.conf import settings


class ApiConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "api"

    def ready(self):
        if settings.USE_OPENAPI_SCHEMA:
            import authentication.schema # noqa
            import files.schema # noqa
            import users.schema # noqa

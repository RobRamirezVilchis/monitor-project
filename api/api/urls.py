from django.urls import path, include, register_converter

from core.urls.converters import ApiVersionConverter


register_converter(ApiVersionConverter, "api_version")

urlpatterns = [
    path("auth/", include(("authentication.urls", "authentication"))),
    path("users/", include(("users.urls", "users"))),
    path("files/", include(("files.urls", "files"))),
]

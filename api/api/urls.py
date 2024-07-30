from django.urls import path, include, re_path, register_converter

from core.urls.converters import ApiVersionConverter


register_converter(ApiVersionConverter, "api_version")

urlpatterns = [
    path("auth/", include("authentication.urls")),
    path("users/", include(("users.urls", "users"))),
    path("files/", include(("files.urls", "files"))),
    path("monitor/", include(("monitor.urls", "monitor"))),
]

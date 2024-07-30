"""
URL configuration for api project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path("", views.home, name="home")
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path("", Home.as_view(), name="home")
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path("blog/", include("blog.urls"))
"""
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include, register_converter
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from core.urls.converters import ApiVersionConverter


register_converter(ApiVersionConverter, "api_version")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/<api_version:version>/", include(("api.urls", "api"))),
    # path("api/<api_version:version>/auth/", include("authentication.urls")),

    # path("api/<api_version:version>/", include("...")),
    # re_path(r"api/(?P<version>[v1|v2|...]+)/", include("...")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.USE_OPENAPI_SCHEMA:
    urlpatterns += [
        path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
        path("api/swagger/",
             SpectacularSwaggerView.as_view(url_name="schema"), name="swagger"),
    ]

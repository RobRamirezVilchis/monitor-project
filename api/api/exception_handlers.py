from django.core import exceptions as dj_exceptions
from django.http import Http404
from rest_framework.views import exception_handler
from drf_standardized_errors.handler import ExceptionHandler as _ExceptionHandler
from rest_framework_simplejwt import exceptions as jwt_exceptions
from rest_framework import exceptions as drf_exceptions
from rest_framework.serializers import as_serializer_error
from rest_framework.response import Response

from core.exceptions import ApplicationError


class ExceptionHandler(_ExceptionHandler):
    def convert_known_exceptions(self, exc: Exception) -> Exception:
        if isinstance(exc, jwt_exceptions.InvalidToken):
            return drf_exceptions.PermissionDenied(
                detail=exc.default_detail,
                code=exc.default_code,
            )
        elif isinstance(exc, ApplicationError):
            return drf_exceptions.APIException({
                None: exc.detail,
                **exc.extra,
            }, exc.code)
        elif isinstance(exc, dj_exceptions.ValidationError):
            return drf_exceptions.ValidationError(as_serializer_error(exc))
        else:
            return super().convert_known_exceptions(exc)
        

def drf_default_with_modifications_exception_handler(exc, ctx):
    if isinstance(exc, dj_exceptions.ValidationError):
        exc = drf_exceptions.ValidationError(as_serializer_error(exc))

    if isinstance(exc, Http404):
        exc = drf_exceptions.NotFound()

    if isinstance(exc, dj_exceptions.PermissionDenied):
        exc = drf_exceptions.PermissionDenied()

    response = exception_handler(exc, ctx)

    # If unexpected error occurs (server error, etc.)
    if response is None:
        return response

    if isinstance(exc.detail, (list, dict)):
        response.data = {"detail": response.data}

    return response


def hacksoft_proposed_exception_handler(exc, ctx):
    """
    {
        "message": "Error message",
        "extra": {}
    }
    """
    if isinstance(exc, dj_exceptions.ValidationError):
        exc = drf_exceptions.ValidationError(as_serializer_error(exc))

    if isinstance(exc, Http404):
        exc = drf_exceptions.NotFound()

    if isinstance(exc, dj_exceptions.PermissionDenied):
        exc = drf_exceptions.PermissionDenied()

    response = exception_handler(exc, ctx)

    # If unexpected error occurs (server error, etc.)
    if response is None:
        if isinstance(exc, ApplicationError):
            data = {"message": exc.detail, "extra": exc.extra}
            return Response(data, status=400)

        return response

    if isinstance(exc.detail, (list, dict)):
        response.data = {"detail": response.data}

    if isinstance(exc, drf_exceptions.ValidationError):
        response.data["message"] = "Validation error"
        response.data["extra"] = {"fields": response.data["detail"]}
    else:
        response.data["message"] = response.data["detail"]
        response.data["extra"] = {}

    del response.data["detail"]

    return response
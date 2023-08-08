from drf_standardized_errors.handler import ExceptionHandler as _ExceptionHandler
from rest_framework_simplejwt import exceptions as jwt_exceptions
from rest_framework import exceptions as drf_exceptions

class ExceptionHandler(_ExceptionHandler):
    def convert_known_exceptions(self, exc: Exception) -> Exception:
        if isinstance(exc, jwt_exceptions.InvalidToken):
            return drf_exceptions.PermissionDenied(
                detail=exc.default_detail,
                code=exc.default_code,
            )
        else:
            return super().convert_known_exceptions(exc)
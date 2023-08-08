from drf_standardized_errors.formatter import ExceptionFormatter as _ExceptionFormatter
from drf_standardized_errors.types import ErrorResponse


class ExceptionFormatter(_ExceptionFormatter):
    def format_error_response(self, error_response: ErrorResponse):
        return {
            "type": error_response.type,
            "errors": [{
                "code": error.code,
                "detail": error.detail,
                "field": error.attr
            } for error in error_response.errors]
        }

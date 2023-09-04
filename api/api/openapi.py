from drf_standardized_errors.openapi import AutoSchema as _AutoSchema


class AutoSchema(_AutoSchema):
    
    def get_serializer_name(self, serializer, direction):
        return serializer.__class__.__qualname__

from drf_spectacular.extensions import OpenApiViewExtension
from drf_spectacular.utils import extend_schema, OpenApiRequest
from rest_framework import serializers

from api.utils import inline_serializer


# Views -----------------------------------------------------------------------


class Fix_FileStandardUploadApi(OpenApiViewExtension):
    target_class = "files.apis.FileStandardUploadApi"

    def view_replacement(self):
        class Fixed(self.target_class):
            serializer_class = serializers.Serializer
            
            @extend_schema(
                request = {
                    "multipart/form-data": {
                        "type": "object",
                        "properties": {
                            "file": {
                                "type": "string",
                                "format": "binary"
                            }
                        }
                    },
                },
                responses = inline_serializer(
                    name = "FileStandardUploadResponseSerializer",
                    fields = {
                        "id": serializers.CharField(),
                    }
                ),
            )
            def post(self, request, *args, **kwargs):
                pass

            @extend_schema(
                request = {
                    "multipart/form-data": {
                        "type": "object",
                        "properties": {
                            "file": {
                                "type": "string",
                                "format": "binary"
                            }
                        }
                    },
                },
                responses = inline_serializer(
                    name = "FileStandardUploadUpdateResponseSerializer",
                    fields = {
                        "id": serializers.CharField(),
                    }
                ),
            )
            def put(self, request, *args, **kwargs):
                pass
        
        return Fixed
    

class Fix_FileDirectUploadStartApi(OpenApiViewExtension):
    target_class = "files.apis.FileDirectUploadStartApi"

    def view_replacement(self):
        class Fixed(self.target_class):
            serializer_class = serializers.Serializer
            
            @extend_schema(
                request = self.target.InputSerializer,
                responses = {
                    200: inline_serializer(
                        name = "FileDirectUploadStartResponseSerializer",
                        fields = {
                            "url": serializers.CharField(),
                        }
                    )
                },
            )
            def post(self, request, *args, **kwargs):
                pass
        
        return Fixed
    

class Fix_FileDirectUploadFinishApi(OpenApiViewExtension):
    target_class = "files.apis.FileDirectUploadFinishApi"

    def view_replacement(self):
        class Fixed(self.target_class):
            serializer_class = serializers.Serializer
            
            @extend_schema(
                request = self.target.InputSerializer,
                responses = inline_serializer(
                    name = "FileDirectUploadFinishResponseSerializer",
                    fields = {
                        "id": serializers.CharField(),
                    }
                ),
            )
            def post(self, request, *args, **kwargs):
                pass
        
        return Fixed
    

class Fix_FileDirectUploadLocalApi(OpenApiViewExtension):
    target_class = "files.apis.FileDirectUploadLocalApi"

    def view_replacement(self):
        class Fixed(self.target_class):
            serializer_class = serializers.Serializer
            
            @extend_schema(
                request = {
                    "multipart/form-data": {
                        "type": "object",
                        "properties": {
                            "file": {
                                "type": "string",
                                "format": "binary"
                            }
                        }
                    },
                },
                responses = inline_serializer(
                    name = "FileDirectUploadLocalResponseSerializer",
                    fields = {
                        "id": serializers.CharField(),
                    }
                ),
            )
            def post(self, request, *args, **kwargs):
                pass
        
        return Fixed

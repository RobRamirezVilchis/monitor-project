from drf_spectacular.extensions import OpenApiViewExtension, OpenApiSerializerExtension
from drf_spectacular.utils import extend_schema, extend_schema_field
from rest_framework import serializers

from api.pagination import get_openapi_pagination_parameters
from api.utils import get_polymorphic_proxy_pagination_serializer, inline_serializer


# Views -----------------------------------------------------------------------


class Fix_UsersWhitelistListApi(OpenApiViewExtension):
    target_class = "users.apis.UsersWhitelistListApi"

    def view_replacement(self):
        class Fixed(self.target_class):
            serializer_class = serializers.Serializer
            
            @extend_schema(
                parameters=[
                    self.target.FilterSerializer,
                    *get_openapi_pagination_parameters(),
                ],
                responses = get_polymorphic_proxy_pagination_serializer(
                    component_name="UsersWhitelistListApiResponse",
                    data_serializer_class=self.target.OutputSerializer,
                ),
            )
            def get(self, request, *args, **kwargs):
                pass

            @extend_schema(
                request=self.target.CreateInputSerializer,
                responses=self.target.OutputSerializer,
            )
            def post(self, request, *args, **kwargs):
                pass
    
        return Fixed


class Fix_UsersWhitelistDetailApi(OpenApiViewExtension):
    target_class = "users.apis.UsersWhitelistDetailApi"

    def view_replacement(self):
        class Fixed(self.target_class):
            serializer_class = serializers.Serializer
            
            @extend_schema(
                request=self.target.UpdateInputSerializer,
                responses=self.target.OutputSerializer,
            )
            def patch(self, request, *args, **kwargs):
                pass
    
        return Fixed


class Fix_UserAccessListApi(OpenApiViewExtension):
    target_class = "users.apis.UserAccessListApi"

    def view_replacement(self):
        class Fixed(self.target_class):
            serializer_class = serializers.Serializer
            
            @extend_schema(
                parameters=[
                    self.target.FilterSerializer,
                    *get_openapi_pagination_parameters(),
                ],
                responses = get_polymorphic_proxy_pagination_serializer(
                    component_name="UserAccessListApiResponse",
                    data_serializer_class=self.target.OutputSerializer,
                ),
            )
            def get(self, request, *args, **kwargs):
                pass
    
        return Fixed
    

# Serializers -----------------------------------------------------------------


class Fix_CommonUserSerializer(OpenApiSerializerExtension):
    target_class = "users.serializers.CommonUserSerializer"

    def map_serializer(self, auto_schema, direction):
        class Fixed(self.target_class):
            @extend_schema_field(inline_serializer(
                name="CommonUserSerializer_ExtraField",
                fields={
                    "picture": serializers.URLField(),
                }
            ))
            def get_extra(self):
                pass

        return auto_schema._map_serializer(Fixed, direction)
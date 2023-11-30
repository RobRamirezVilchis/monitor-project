from typing import Optional
from django.db.models import Model
from drf_spectacular.openapi import AutoSchema
from rest_framework import serializers
from drf_spectacular.extensions import OpenApiViewExtension, OpenApiSerializerExtension, OpenApiSerializerFieldExtension
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import Direction, extend_schema, extend_schema_field, extend_schema_serializer, OpenApiParameter

from api.utils import inline_serializer


# Views -----------------------------------------------------------------------


class Fix_SocialAccountListView(OpenApiViewExtension):
    target_class = "dj_rest_auth.registration.views.SocialAccountListView"

    def view_replacement(self):
        class Fixed(self.target_class):
            pagination_class = None
            filter_backends = []
            
        return Fixed
    

class Fix_GoogleLoginApi(OpenApiViewExtension):
    target_class = "authentication.views.GoogleLoginApi"

    def view_replacement(self):
        class Fixed(self.target_class):
            @extend_schema(
                responses = inline_serializer(
                    name = "GoogleLoginResponseSerializer",
                    fields = {"key": serializers.CharField()}
                )
            )
            def post(self, request, *args, **kwargs):
                pass

        return Fixed
    

class Fix_GoogleConnectApi(OpenApiViewExtension):
    target_class = "authentication.views.GoogleConnectApi"

    def view_replacement(self):
        class Fixed(self.target_class):
            @extend_schema(
                responses = inline_serializer(
                    name = "GoogleConnectResponseSerializer",
                    fields = {"key": serializers.CharField()}
                )
            )
            def post(self, request, *args, **kwargs):
                pass

        return Fixed
    
class Fix_SocialAccountDisconnectView(OpenApiViewExtension):
    target_class = "dj_rest_auth.registration.views.SocialAccountDisconnectView"

    def view_replacement(self):
        class Fixed(self.target_class):
            @extend_schema(
                responses={ 200: {} }
            )
            def post(self, request, *args, **kwargs):
                pass

        return Fixed


class Fix_RegistrationKeyValidApi(OpenApiViewExtension):
    target_class = "authentication.views.RegistrationKeyValidApi"

    def view_replacement(self):
        class Fixed(self.target_class):
            @extend_schema(
                parameters = [OpenApiParameter("key", str, OpenApiParameter.QUERY, True, "The registration key.")],
                responses = inline_serializer(
                    name = "RegistrationKeyValidResponseSerializer",
                    fields = {"detail": serializers.CharField()}
                )
            )
            def get(self, request, *args, **kwargs):
                pass

        return Fixed
    

class Fix_PasswordResetKeyValidApi(OpenApiViewExtension):
    target_class = "authentication.views.PasswordResetKeyValidApi"

    def view_replacement(self):
        from authentication.serializers import PasswordResetKeyValidSerializer

        class Fixed(self.target_class):
            @extend_schema(
                parameters = [PasswordResetKeyValidSerializer], 
                responses = inline_serializer(
                    name = "PasswordResetKeyValidResponseSerializer",
                    fields={"detail": serializers.CharField()}
                )
            )
            def get(self, request, *args, **kwargs):
                pass

        return Fixed
    

# Serializers ------------------------------------------------------------------


class Fix_UserDetailsSerializer(OpenApiSerializerExtension):
    target_class = "authentication.serializers.CustomUserDetailsSerializer"

    def map_serializer(self, auto_schema, direction):
        class Fixed(self.target_class):
            roles = serializers.ListField(child=serializers.CharField())
            permissions = serializers.ListField(child=serializers.CharField())

            @extend_schema_field(inline_serializer(
                name="UserDetailsSerializer_ExtraField",
                fields={
                    "picture": serializers.URLField(),
                },
            ))
            def get_extra(self):
                pass

        return auto_schema._map_serializer(Fixed, direction)

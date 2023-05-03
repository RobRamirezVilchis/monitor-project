import os
# from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from django.utils.translation import gettext_lazy as _
from django.http import HttpRequest, HttpResponse
from django.dispatch import receiver
from rest_framework.exceptions import MethodNotAllowed
from rest_framework import generics, status
from rest_framework.generics import DestroyAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from allauth.account.signals import user_signed_up
from dj_rest_auth.registration.views import (
    SocialLoginView, VerifyEmailView, SocialConnectView
)
from dj_rest_auth.views import UserDetailsView

from .adapter import GoogleOAuth2Adapter
from .functions import delete_user
from .serializers import PasswordResetKeyValidSerializer

GOOGLE_CALLBACK_URL = os.getenv("GOOGLE_CALLBACK_URL")

class GoogleLoginView(SocialLoginView):
    authentication_classes = []
    adapter_class = GoogleOAuth2Adapter
    callback_url = GOOGLE_CALLBACK_URL
    client_class = OAuth2Client


class GoogleConnectView(SocialConnectView):
    adapter_class = GoogleOAuth2Adapter


class RegistrationKeyValidView(VerifyEmailView):
    """
        Params: key (string)
    """

    def get(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.GET)
        serializer.is_valid(raise_exception=True)
        self.kwargs["key"] = serializer.validated_data['key']
        self.get_object() # If there's no error, the key is still valid
        return Response({"detail": _("ok")}, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        raise MethodNotAllowed('POST')


class PasswordResetKeyValidView(generics.GenericAPIView):
    """
        Params: uid (string), token (string)
    """
    serializer_class = PasswordResetKeyValidSerializer
    permission_classes = (AllowAny,)
    throttle_scope = 'dj_rest_auth'

    def get(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.GET)
        serializer.is_valid(raise_exception=True)
        return Response(
            {'detail': _('Ok.')},
        )
    

class UserView(UserDetailsView, DestroyAPIView):
    """
    Reads and updates UserModel fields
    Accepts GET, PUT, PATCH, DELETE methods.

    Default accepted fields: username, first_name, last_name
    Default display fields: pk, username, email, first_name, last_name
    Read-only fields: pk, email

    Returns UserModel fields.
    """
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        delete_user(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

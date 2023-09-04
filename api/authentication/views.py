# from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView, VerifyEmailView, SocialConnectView
from dj_rest_auth.views import UserDetailsView
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from rest_framework import generics, status
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.generics import DestroyAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from users.services import UserService, UserAccessService

from .adapter import GoogleOAuth2Adapter
from .serializers import PasswordResetKeyValidSerializer
from . import listeners #? Necessary to register the listeners


class GoogleLoginView(SocialLoginView):
    authentication_classes = []
    adapter_class = GoogleOAuth2Adapter
    callback_url = settings.GOOGLE_CALLBACK_URL
    client_class = OAuth2Client


class GoogleConnectView(SocialConnectView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = settings.GOOGLE_CALLBACK_URL
    client_class = OAuth2Client


class RegistrationKeyValidView(VerifyEmailView):
    """
        Checks if the registration key is valid.

        Params: key (string)
    """
    allowed_methods = ("GET", "OPTIONS", "HEAD")

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
        Checks if the password reset token is valid.

        Params: uid (string), token (string)
    """
    serializer_class = PasswordResetKeyValidSerializer
    permission_classes = (AllowAny,)
    throttle_scope = "dj_rest_auth"

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
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        UserAccessService.log_access(instance)

        return super().retrieve(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        UserService.soft_delete(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

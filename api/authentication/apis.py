# from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from . import listeners  # ? Necessary to register the listeners
from .serializers import PasswordResetKeyValidSerializer, RegisterWithoutPasswordSerializer, RegisterWithoutPasswordConfirmSerializer
from .forms import PasswordResetForm
from allauth.account import app_settings as allauth_account_settings, signals
from allauth.account.adapter import get_adapter
from allauth.utils import email_address_exists, get_username_max_length
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import RegisterView, SocialLoginView, SocialConnectView, VerifyEmailView
from dj_rest_auth.views import LoginView, UserDetailsView, PasswordResetConfirmView
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from rest_framework import status, serializers, views
from rest_framework import exceptions
from rest_framework.generics import DestroyAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from common.services import model_update
from users.services import UsersService, UserAccessService

from users.services import UserWhitelistService
from .adapter import GoogleOAuth2Adapter


class GoogleLoginApi(SocialLoginView):
    authentication_classes = []
    adapter_class = GoogleOAuth2Adapter
    """
        `postmessage` should be used when the client uses the `popup` ux_mode
        see: https://stackoverflow.com/questions/55222501/google-oauth-redirect-uri-mismatch-when-exchanging-one-time-code-for-refresh-tok?rq=1
    """
    callback_url = settings.GOOGLE_CALLBACK_URL
    client_class = OAuth2Client


class GoogleConnectApi(SocialConnectView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = settings.GOOGLE_CALLBACK_URL
    client_class = OAuth2Client


class LoginApi(LoginView):

    def pre_login(self, request, user):
        if not UserWhitelistService.is_email_whitelisted(user.email):
            raise exceptions.PermissionDenied("Registration invalid.")
        return True

    def post(self, request, *args, **kwargs):
        self.request = request
        self.serializer = self.get_serializer(data=self.request.data)
        self.serializer.is_valid(raise_exception=True)

        user = self.serializer.validated_data["user"]
        self.pre_login(request, user)
        self.login()
        return self.get_response()


class RegistrationKeyValidApi(VerifyEmailView):
    """
        Checks if the registration key is valid.

        Params: key (string)
    """
    allowed_methods = ("GET", "OPTIONS", "HEAD")

    def get(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.GET)
        serializer.is_valid(raise_exception=True)
        self.kwargs["key"] = serializer.validated_data["key"]
        self.get_object()  # If there's no error, the key is still valid
        return Response({"detail": _("ok")}, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        raise exceptions.MethodNotAllowed("POST")


class PasswordResetKeyValidApi(views.APIView):
    """
        Checks if the password reset token is valid.

        Params: uid (string), token (string)
    """
    permission_classes = [AllowAny]
    throttle_scope = "dj_rest_auth"

    def get(self, request, *args, **kwargs):
        serializer = PasswordResetKeyValidSerializer(data=request.GET)
        serializer.is_valid(raise_exception=True)
        return Response(
            {"detail": _("Ok.")},
        )


class UserApi(UserDetailsView, DestroyAPIView):
    """
    Reads and updates UserModel fields
    Accepts GET, PUT, PATCH, DELETE methods.

    Default accepted fields: first_name, last_name, password1, password2
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
        service = UsersService(instance)
        service.soft_delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    class UpdateSerializer(serializers.Serializer):
        first_name = serializers.CharField(
            max_length=150, required=False, allow_blank=True)
        last_name = serializers.CharField(max_length=150, required=False)
        password1 = serializers.CharField(required=False)
        password2 = serializers.CharField(required=False)

        def validate(self, data):
            if data.get("password1") != data.get("password2"):
                raise serializers.ValidationError("Passwords do not match.")
            data.pop("password2", None)
            password = data.pop("password1", None)
            if password:
                data["password"] = password
            return data

        def validate_username(self, username):
            username = get_adapter().clean_username(username, True)
            return username

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.UpdateSerializer(
            instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        password = serializer.validated_data.pop("password", None)

        if password:
            instance.set_password(password)
            instance.save()

        instance, updated = model_update(
            instance=instance,
            fields=serializer.validated_data.keys(),
            data=serializer.validated_data
        )

        if getattr(instance, "_prefetched_objects_cache", None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)


class RegisterWithoutPasswordApi(RegisterView):
    """
        WARNING: This generates tokens for any non verified user so it should be used with caution by selected users.
        ACCOUNT_EMAIL_VERIFICATION = "mandatory" is recommended when using this api endpoint.
    """
    serializer_class = RegisterWithoutPasswordSerializer
    permission_classes = []

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save(self.request)
        signals.user_signed_up.send(
            sender=user.__class__, request=request, user=user)

        # Send confirmation e-mail with password reset link
        if 'allauth' in settings.INSTALLED_APPS:
            from allauth.account.forms import default_token_generator
        else:
            from django.contrib.auth.tokens import default_token_generator
        reset_form = PasswordResetForm(data={"email": user.email})
        if not reset_form.is_valid():
            raise serializers.ValidationError(reset_form.errors)
        opts = {
            "use_https": request.is_secure(),
            "from_email": getattr(settings, "DEFAULT_FROM_EMAIL"),
            "request": request,
            "token_generator": default_token_generator,

            "email_template_name": "email_register_password_reset",
            "base_url": settings.FRONTEND_URL,
            "url_path": "register/<uid>/<token>/",

            # "send_mail": False
        }
        reset_form.save(**opts)
        return Response(
            {"detail": "User confirmation e-mail sent."},
            status=status.HTTP_201_CREATED
        )

        # email, tokens = reset_form.save(**opts)
        # return Response(
        #     { "detail": "User confirmation e-mail sent.", "tokens": tokens },
        #     status=status.HTTP_201_CREATED
        # )


class RegisterWithoutPasswordConfirmApi(PasswordResetConfirmView):
    serializer_class = RegisterWithoutPasswordConfirmSerializer

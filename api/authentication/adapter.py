from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import app_settings as auth_settings, DefaultSocialAccountAdapter
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter as DefaultGoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Error
from django.conf import settings
from django.contrib.sites.shortcuts import get_current_site
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.utils.encoding import force_str
from rest_framework import exceptions, status
from rest_framework.response import Response
import jwt

from users.services import UserWhitelistService


class AccountAdapter(DefaultAccountAdapter):

    def format_email_subject(self, subject):
        prefix = getattr(auth_settings, "EMAIL_SUBJECT_PREFIX", None)
        if prefix is None:
            return subject
        return prefix + force_str(subject)

    def send_confirmation_mail(self, request, emailconfirmation, signup):
        frontend_url = settings.FRONTEND_URL
        activation_url = self.get_email_confirmation_url(
            None, emailconfirmation)

        ctx = {
            "frontend_url": frontend_url,
            "activation_url": activation_url,
            "key": emailconfirmation.key,
        }
        if signup:
            email_template = "email_confirmation_signup"
        else:
            email_template = "email_confirmation"
        self.send_mail(
            email_template, emailconfirmation.email_address.email, ctx)

    def get_email_confirmation_url(self, request, emailconfirmation):
        """Constructs the email confirmation (activation) url.

        Note that if you have architected your system such that email
        confirmations are sent outside of the request context `request`
        can be `None` here.
        """
        frontend_url = settings.FRONTEND_URL
        register_confirm_path = settings.FRONTEND_REGISTER_CONFIRM_PATH
        register_confirm_path = register_confirm_path.replace(
            "<key>", emailconfirmation.key)
        return f"{frontend_url}/{register_confirm_path}"

    def respond_user_inactive(self, request, user):
        return exceptions.PermissionDenied("User inactive or deleted.")

    def respond_email_verification_sent(self, request, user):
        return Response({"detail": "Verification e-mail sent."}, status=status.HTTP_200_OK)

    def pre_login(
        self,
        request,
        user,
        **kwargs
    ):
        print("pre login")
        if not UserWhitelistService.is_email_whitelisted(user.email):
            raise exceptions.PermissionDenied("Registration invalid.")
        return super().pre_login(request, user, **kwargs)

    def is_open_for_signup(self, request):
        if not UserWhitelistService.is_email_whitelisted(request.user.email):
            raise exceptions.PermissionDenied("Registration invalid.")
        return True


class SocialAccountAdapter(DefaultSocialAccountAdapter):

    def get_app(self, request, provider, config=None):
        # NOTE: Avoid loading models at top due to registry boot...
        from allauth.socialaccount.models import SocialApp

        config = config or auth_settings.PROVIDERS.get(provider, {}).get("APP")
        if config:
            # app = SocialApp(provider=provider)
            app = SocialApp.objects.get_or_create(provider=provider)[0]
            for field in ["client_id", "secret", "key", "certificate_key"]:
                setattr(app, field, config.get(field))
        else:
            app = SocialApp.objects.get_current(provider, request)

        return app

    def get_connect_redirect_url(self, request, socialaccount):
        """
        Returns the default URL to redirect to after successfully
        connecting a social account.
        """
        url = reverse("api:authentication:socialaccount_connections",
                      kwargs={"version": "v1"})
        return url

    # def pre_social_login(self, request, sociallogin):
    #     if not UserWhitelistService.is_email_whitelisted(sociallogin.user.email):
    #         raise exceptions.PermissionDenied("Registration invalid.")
    #     return True

    # def is_open_for_signup(self, request, sociallogin):
    #     if not UserWhitelistService.is_email_whitelisted(sociallogin.user.email):
    #         raise exceptions.PermissionDenied("Registration invalid.")
    #     return True


class GoogleOAuth2Adapter(DefaultGoogleOAuth2Adapter):

    def complete_login(self, request, app, token, response, **kwargs):
        try:
            token = response["id_token"]
            if isinstance(token, dict):
                token = token["id_token"]
            identity_data = jwt.decode(
                token,
                # Since the token was received by direct communication
                # protected by TLS between this library and Google, we
                # are allowed to skip checking the token signature
                # according to the OpenID Connect Core 1.0
                # specification.
                # https://openid.net/specs/openid-connect-core-1_0.html#IDTokenValidation
                options={
                    "verify_signature": False,
                    "verify_iss": True,
                    "verify_aud": True,
                    "verify_exp": True,
                },
                issuer=self.id_token_issuer,
                audience=app.client_id,
            )
        except jwt.PyJWTError as e:
            raise OAuth2Error("Invalid id_token") from e
        login = self.get_provider().sociallogin_from_response(request, identity_data)
        return login

from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import app_settings, DefaultSocialAccountAdapter
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter as DefaultGoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Error
from allauth.utils import build_absolute_uri
from django.conf import settings
from django.contrib.sites.shortcuts import get_current_site
from django.core.mail import EmailMessage, EmailMultiAlternatives
from django.http import HttpResponseRedirect
from django.template import TemplateDoesNotExist
from django.template.loader import render_to_string
from django.urls import reverse
import jwt

from .services import get_frontend_url


class AccountAdapter(DefaultAccountAdapter):
   
    def send_confirmation_mail(self, request, emailconfirmation, signup):
        frontend_url = get_frontend_url()
        # activation_url = f"{frontend_url}/auth/register/{emailconfirmation.key}"
        register_confirm_path = settings.FRONTEND_REGISTER_CONFIRM_PATH
        register_confirm_path = register_confirm_path.replace("<key>", emailconfirmation.key)
        activation_url = f"{frontend_url}/{register_confirm_path}"
        
        ctx = {
            "frontend_url": frontend_url,
            "activation_url": activation_url,
            "key": emailconfirmation.key,
        }
        if signup:
            email_template = "email_confirmation_signup"
        else:
            email_template = "email_confirmation"
        self.send_mail(email_template, emailconfirmation.email_address.email, ctx)

    def render_mail(self, template_prefix, email, context, headers=None):
        """
        Renders an e-mail to `email`.  `template_prefix` identifies the
        e-mail that is to be sent, e.g. "account/email/email_confirmation"
        """
        to = [email] if isinstance(email, str) else email
        subject = render_to_string("{0}_subject.txt".format(template_prefix), context)
        # remove superfluous line breaks
        subject = " ".join(subject.splitlines()).strip()

        from_email = self.get_from_email()

        bodies = {}
        for ext in ["html", "txt"]:
            try:
                template_name = "{0}_message.{1}".format(template_prefix, ext)
                bodies[ext] = render_to_string(
                    template_name,
                    context,
                    self.request,
                ).strip()
            except TemplateDoesNotExist:
                if ext == "txt" and not bodies:
                    # We need at least one body
                    raise
        if "txt" in bodies:
            msg = EmailMultiAlternatives(
                subject, bodies["txt"], from_email, to, headers=headers
            )
            if "html" in bodies:
                msg.attach_alternative(bodies["html"], "text/html")
        else:
            msg = EmailMessage(subject, bodies["html"], from_email, to, headers=headers)
            msg.content_subtype = "html"  # Main content is now text/html
        return msg

    def get_email_confirmation_url(self, request, emailconfirmation):
        """Constructs the email confirmation (activation) url.

        Note that if you have architected your system such that email
        confirmations are sent outside of the request context `request`
        can be `None` here.
        """
        url = reverse("api:authentication:account_confirm_email", args = [emailconfirmation.key], kwargs = { "version": "v1" })
        ret = build_absolute_uri(request, url)
        return ret
    
    def respond_user_inactive(self, request, user):
        return HttpResponseRedirect(reverse("api:authentication:account_inactive"), kwargs = { "version": "v1" })

    def respond_email_verification_sent(self, request, user):
        return HttpResponseRedirect(reverse("api:authentication:account_email_verification_sent"), kwargs = { "version": "v1" })


class SocialAccountAdapter(DefaultSocialAccountAdapter):

    def get_app(self, request, provider, config=None):
        # NOTE: Avoid loading models at top due to registry boot...
        from allauth.socialaccount.models import SocialApp

        config = config or app_settings.PROVIDERS.get(provider, {}).get("APP")
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
        url = reverse("api:authentication:socialaccount_connections", kwargs = { "version": "v1" })
        return url


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

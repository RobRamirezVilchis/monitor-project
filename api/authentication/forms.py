from django.conf import settings
from django.contrib.sites.shortcuts import get_current_site
from django.urls import reverse

from dj_rest_auth.forms import AllAuthPasswordResetForm
if 'allauth' in settings.INSTALLED_APPS:
    from allauth.account import app_settings
    from allauth.account.adapter import get_adapter
    from allauth.account.forms import \
        ResetPasswordForm as DefaultPasswordResetForm
    from allauth.account.forms import default_token_generator
    from allauth.account.utils import (filter_users_by_email,
                                       user_pk_to_url_str, user_username)
    from allauth.utils import build_absolute_uri

from .functions import get_frontend_url

class PasswordResetForm(AllAuthPasswordResetForm):
    def save(self, request, **kwargs):
        current_site = get_current_site(request)
        email = self.cleaned_data['email']
        token_generator = kwargs.get('token_generator', default_token_generator)

        for user in self.users:

            uid = user_pk_to_url_str(user)
            temp_key = token_generator.make_token(user)

            # save it to the password reset model
            # password_reset = PasswordReset(user=user, temp_key=temp_key)
            # password_reset.save()

            # send the password reset email
            frontend_url = get_frontend_url()
            # url = f"{frontend_url}/auth/password-reset/confirm/{uid}/{temp_key}"
            password_reset_path = settings.ENV["FRONTEND_PASSWORD_RESET_PATH"]
            password_reset_path = password_reset_path.replace("<uid>", uid).replace("<token>", temp_key)
            url = f"{frontend_url}/{password_reset_path}"
            context = {
                'current_site': current_site,
                'user': user,
                'password_reset_url': url,
                "uid": uid,
                "key": temp_key,
                'request': request,
            }
            if app_settings.AUTHENTICATION_METHOD != app_settings.AuthenticationMethod.EMAIL:
                context['username'] = user_username(user)
            get_adapter(request).send_mail(
                'email_password_reset', email, context
            )
        return self.cleaned_data['email']
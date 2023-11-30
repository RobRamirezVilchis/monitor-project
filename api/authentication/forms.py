from dj_rest_auth.forms import AllAuthPasswordResetForm
from django.conf import settings
from django.contrib.sites.shortcuts import get_current_site
if "allauth" in settings.INSTALLED_APPS:
    from allauth.account import app_settings
    from allauth.account.adapter import get_adapter
    from allauth.account.forms import default_token_generator
    from allauth.account.utils import user_pk_to_url_str, user_username

class PasswordResetForm(AllAuthPasswordResetForm):
    def save(
        self, 
        request, 
        email_template_name, 
        *, 
        token_generator=default_token_generator,
        extra_context=None,
        base_url=None,
        url_path=None,
        send_email=True,
        **kwargs
    ):
        email = self.cleaned_data["email"]
        token_generator = token_generator
        tokens = []

        for user in self.users:
            uid = user_pk_to_url_str(user)
            temp_key = token_generator.make_token(user)
            tokens.append({"uid": uid, "token": temp_key})

            # send the password reset email
            url = None
            if base_url and url_path:
                url_path_formatted = url_path.replace("<uid>", uid).replace("<token>", temp_key)
                url = f"{base_url}/{url_path_formatted}"
          
            context = {
                "user": user,
                "url": url,
                "uid": uid,
                "key": temp_key,
                "request": request,
                **(extra_context or {}),
            }
            if app_settings.AUTHENTICATION_METHOD != app_settings.AuthenticationMethod.EMAIL:
                context["username"] = user_username(user)
            if send_email:
                get_adapter(request).send_mail(
                    email_template_name, email, context
                )
        if send_email:  
            return self.cleaned_data["email"]
        else:
            return self.cleaned_data["email"], tokens

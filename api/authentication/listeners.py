from allauth.account.signals import user_logged_in, user_logged_out
from allauth.socialaccount.models import SocialAccount, SocialToken
from django.dispatch import receiver
import requests


@receiver(user_logged_in)
def on_user_logged_in(sender, request, user, **kwargs):
    social_account = SocialAccount.objects.filter(
        user=user, provider='google').first()
    
    if social_account:
        # Set session expiration to 6 months
        request.session.set_expiry(6 * 30 * 24 * 60 * 60)
    else:
        # Set session expiration to 24 hours
        request.session.set_expiry(24 * 60 * 60)


@receiver(user_logged_out)
def on_user_logged_out(sender, request, user, **kwargs):
    try:
        token = SocialToken.objects.get(account__user=user, account__provider='google')
        access_token = token.token
        if access_token:
            requests.get(f"https://accounts.google.com/o/oauth2/revoke?token={access_token}")
    except Exception as e:
        pass
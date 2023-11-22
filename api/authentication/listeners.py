from allauth.account.signals import user_logged_in
from allauth.socialaccount.models import SocialAccount, SocialToken
from django.dispatch import receiver
from django.conf import settings


@receiver(user_logged_in)
def on_user_logged_in(sender, request, user, **kwargs):
    social_account = SocialAccount.objects.filter(
        user=user, provider="google").first()
    
    # Update session expiry based on whether the user logged in with a social
    # account or not.
    if social_account:
        request.session.set_expiry(settings.SOCIAL_SESSION_LIFETIME)
    else:
        request.session.set_expiry(settings.SESSION_LIFETIME)

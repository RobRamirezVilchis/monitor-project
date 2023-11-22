from allauth.account.signals import user_logged_in, user_logged_out
from allauth.socialaccount.models import SocialAccount, SocialToken
from django.dispatch import receiver


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

from allauth.account.signals import user_signed_up
from django.dispatch import receiver

from users.models import UserWhitelist


@receiver(user_signed_up)
def on_user_signed_up(sender, request, user, **kwargs):
    # Set user to its user whitelist instance
    whitelist_user = UserWhitelist.objects.get(email=user.email)
    whitelist_user.user = user
    whitelist_user.save()
    # Add user to its group
    user.groups.add(whitelist_user.group)
    user.save()

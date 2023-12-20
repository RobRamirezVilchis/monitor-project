from allauth.account.signals import user_signed_up
from django.dispatch import receiver
import logging

from .models import UserWhitelist
from .services import UsersService


logger = logging.getLogger("core")

@receiver(user_signed_up)
def on_user_signed_up(sender, request, user, **kwargs):
    try:
        # Set user to its user whitelist instance
        whitelist_user = UserWhitelist.objects.get(email=user.email)
        whitelist_user.user = user
        whitelist_user.save()
        # Add user to its group
        user.groups.add(whitelist_user.group)
        user.save()
    except:
        logger.warn(f"User {user.email} signed up but they are not whitelisted!")
        # service = UsersService(user)
        # service.soft_delete()

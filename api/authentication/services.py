from allauth.account.models import EmailAddress
from allauth.socialaccount.models import SocialAccount
from django.db import transaction
from django.conf import settings

from . import constants


@transaction.atomic
def user_soft_delete(user):
    if not user:
        return

    user.is_active = False
    user.username = constants.DELETED_PREFIX + str(user.id) + "_" + user.username
    user.email = constants.DELETED_PREFIX + str(user.id) + "_" + user.email
    user.groups.clear()
    user.user_permissions.clear()
    user.save()

    try:
        email_address = EmailAddress.objects.get(user = user)
        email_address.verified = False
        email_address.email = constants.DELETED_PREFIX + str(user.id) + "_" + email_address.email
        email_address.save()
    except (EmailAddress.DoesNotExist):
        pass

    try:
        social_account = SocialAccount.objects.get(user = user)
        social_account.delete()
    except (SocialAccount.DoesNotExist):
        pass


def get_frontend_url():
    frontend_url = settings.ENV["FRONTEND_URL"]
    return frontend_url

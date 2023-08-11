from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError

from users.services import UserWhitelistService


User = get_user_model()

class Command(BaseCommand):
    help = "Removes a user from the whitelist and deletes the user if it exists."

    def add_arguments(self, parser):
        parser.add_argument("email", type=str)

    def handle(self, *args, **options):
        email = options["email"]

        whitelist_instance = UserWhitelistService.get_by_email(email)
        if whitelist_instance is not None:
            had_user = whitelist_instance.user is not None
            UserWhitelistService.delete(whitelist_instance)
            self.stdout.write(self.style.SUCCESS("Successfully removed user with email %s from the whitelist." % email))
            if had_user:
                self.stdout.write(self.style.SUCCESS("Successfully deleted user with email %s." % email))
        else:
            self.stdout.write(self.style.NOTICE("User with email %s is not in the whitelist." % email))

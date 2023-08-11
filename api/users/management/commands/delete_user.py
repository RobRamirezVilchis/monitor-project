from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model

from users.services import UserService


User = get_user_model()

class Command(BaseCommand):
    help = "Deletes a user by email"

    def add_arguments(self, parser):
        parser.add_argument("email", type=str)

    def handle(self, *args, **options):
        email = options["email"]
        try:
            user = User.objects.get(email=email, is_active=True)
        except User.DoesNotExist:
            raise CommandError("User with email %s does not exist. No changes were made." % email)
        self.stdout.write(
            self.style.SUCCESS(
                f"Are you sure you want to delete user {user.first_name} {user.last_name} with email {user.email} and id {user.id}?"
            )
        )
        answer = input("Type 'yes' to confirm: ")
        if answer != "yes":
            self.stdout.write(self.style.ERROR("Aborted. No changes were made."))
            return
        UserService.soft_delete(user)
        self.stdout.write(self.style.SUCCESS("Successfully deleted user with email %s." % email))

from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model

from users.enums import user_roles


User = get_user_model()

class Command(BaseCommand):
    help = "Set the default roles for the application."

    def handle(self, *args, **options):
        roles = user_roles

        try:
            # Filter out existing groups
            existing_roles = Group.objects.filter(
                name__in=roles
            ).values_list("name", flat=True)
            new_role_groups = [Group(name=role) for role in roles if role not in existing_roles]

            # Create the groups
            Group.objects.bulk_create(new_role_groups)
            self.stdout.write(self.style.SUCCESS("Successfully created the default roles."))
        except Exception as e:
            raise CommandError("Error creating the default roles: %s" % e)



from django.apps import apps
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import Group, Permission
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType

from users.enums import UserRoles
from users.role_permissions import role_permissions
from users.services import UserRolesService
from common.utils import value_to_enum


User = get_user_model()

class Command(BaseCommand):
    help = "Set the default roles for the application."

    def handle(self, *args, **options):
        roles = UserRolesService.values

        try:
            # Filter out existing groups
            existing_groups = Group.objects.filter(
                name__in=roles
            )
            existing_groups_names = [group.name for group in existing_groups]
            new_groups = [Group.objects.create(name=role) for role in roles if role not in existing_groups_names]
            
            groups = list(existing_groups) + list(new_groups)
            permissions_cache = {}
            for group in groups:
                permissions = role_permissions.get(value_to_enum(UserRoles, group.name), [])
                group_permissions = []
                for app_model, codename in permissions:
                    try:
                        app_label, model_name = app_model.split(".")
                    except ValueError:
                        raise CommandError("Invalid permission for '%s'. Format must be 'app.model'." % app_model)
                    model = apps.get_model(app_label, model_name)
                    content_type =  ContentType.objects.get_for_model(model)
                    if (model, codename) not in permissions_cache:
                        permissions_cache[(model, codename)] = Permission.objects.get(
                            content_type=content_type,
                            codename=codename,
                        )

                    group_permissions.append(permissions_cache[(model, codename)])
                group.permissions.set(group_permissions)

            
            self.stdout.write(self.style.SUCCESS("Successfully created the default roles."))
        except Exception as e:
            raise CommandError("Error creating the default roles: %s" % e)

from django.core.management.base import BaseCommand, CommandError
from rest_framework import serializers

from users.services import UserRolesService, UserWhitelistService


class CreateInputSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=254, required=True)
    group = serializers.CharField(max_length=254, required=True)

    def validate_group(self, value):
        if value not in UserRolesService.values:
            raise serializers.ValidationError("Invalid group")
        return value
    

class Command(BaseCommand):
    help = "Adds a user to the whitelist or updates the group of an existing user."

    def add_arguments(self, parser):
        parser.add_argument("email", type=str)
        parser.add_argument("group", type=str)

    def handle(self, *args, **options):
        serializer = CreateInputSerializer(data=options)
        if not serializer.is_valid():
            if "group" in serializer.errors:
                serializer.errors["group"].append("Group must be one of %s." % UserRolesService.values)
            raise CommandError(serializer.errors)
        
        email = serializer.validated_data["email"]

        whitelist_instance = UserWhitelistService.get_by_email(email)
        if whitelist_instance is not None:
            UserWhitelistService.update(whitelist_instance, serializer.validated_data)
            self.stdout.write(self.style.SUCCESS("Successfully updated the group of user with email %s." % email))
        else:
            UserWhitelistService.create(serializer.validated_data)
            self.stdout.write(self.style.SUCCESS("Successfully added user with email %s to the whitelist." % email))

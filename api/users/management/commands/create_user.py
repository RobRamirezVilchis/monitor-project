import getpass
from allauth.account import app_settings as allauth_account_settings
from allauth.account.adapter import get_adapter
from allauth.account.models import EmailAddress
from allauth.account.utils import user_email, user_username, user_field
from allauth.utils import email_address_exists, get_username_max_length
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from rest_framework import serializers

from users.services import UserRolesService
from users.models import Group


User = get_user_model()
    

class Command(BaseCommand):
    help = "Register a user to be used by email/username."

    def add_arguments(self, parser):
        parser.add_argument("email", type=str, help="The user's email address.")
        parser.add_argument("-u", "--username", type=str, help="(optional) The user's username. If not given, the email address will be used.")
        parser.add_argument("-f", "--first_name", type=str, help="(optional) The user's first name.", default="")
        parser.add_argument("-l", "--last_name", type=str, help="(optional) The user's last name.", default="")
        parser.add_argument("-r", "--roles", nargs="+", type=str, choices=UserRolesService.values, help="(optional) The user's roles.")
        parser.add_argument("--pw", action="store_true", help="If set, the user will be prompted to enter a password.")
        parser.add_argument("--verified", action="store_true", help="If set, the user's account will be verified.")
        parser.add_argument("--super", action="store_true", help="If set, the user will be a superuser.")
        parser.add_argument("--staff", action="store_true", help="If set, the user will be staff.")

    def handle(self, *args, **options):
        serializer = CreateInputSerializer(data=options)
        if not serializer.is_valid():
            raise CommandError(serializer.errors)
        data = serializer.validated_data
        password = None
        if options["pw"]:
            password = getpass.getpass()
            password2 = getpass.getpass("Password (again): ")
            if password != password2:
                self.stderr.write("Error: Your passwords didn't match.")
                return
            password = get_adapter().clean_password(password)

        user = User()
        user_email(user, data["email"])
        user_username(user, data.get("username", None) or data["email"])
        user_field(user, "first_name", data.get("first_name"))
        user_field(user, "last_name", data.get("last_name"))
        user.is_superuser = options["super"]
        user.is_staff = options["staff"]
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        
        EmailAddress.objects.create(
            user=user, 
            email=user.email,
            verified=options["verified"],
            primary=True,
        )
        
        if data["roles"]:
            groups = Group.objects.filter(name__in=data["roles"]).all()
            user.groups.set(groups)


class CreateInputSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=254, required=True)
    username = serializers.CharField(
        max_length=get_username_max_length(),
        min_length=allauth_account_settings.USERNAME_MIN_LENGTH,
        required=False, # allauth_account_settings.USERNAME_REQUIRED,
        allow_null=True,
    )
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    roles = serializers.ListField(
        child=serializers.CharField(max_length=32),
        required=False,
        allow_null=True,
    )

    def validate_username(self, username):
        if username:
            username = get_adapter().clean_username(username, True)
        return username
    
    def validate_email(self, email):
        email = get_adapter().clean_email(email)
        if allauth_account_settings.UNIQUE_EMAIL:
            if email and self.user_exists(email):
                raise serializers.ValidationError(
                    "A user is already registered with this e-mail address.",
                )
        return email.lower()
    
    def validate_roles(self, roles):
        if roles and not all(role in UserRolesService.values for role in roles):
            raise serializers.ValidationError("Invalid roles")
        return roles
    
    def user_exists(self, email, exclude_user=None):
        emailaddresses = EmailAddress.objects.exclude(verified=False)
        if exclude_user:
            emailaddresses = emailaddresses.exclude(user=exclude_user)
        return emailaddresses.filter(email__iexact=email, primary=True).exists()
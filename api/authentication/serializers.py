from allauth.account import app_settings as allauth_account_settings
from allauth.account.adapter import get_adapter
from allauth.account.models import EmailAddress
from allauth.account.utils import user_field, setup_user_email
from allauth.socialaccount.models import SocialAccount
from dj_rest_auth.registration.serializers import RegisterSerializer
from dj_rest_auth.serializers import PasswordResetSerializer, UserDetailsSerializer, PasswordResetConfirmSerializer
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from django.utils.encoding import force_str
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from .forms import PasswordResetForm


UserModel = get_user_model()


class CustomPasswordResetSerializer(PasswordResetSerializer):
    @property
    def password_reset_form_class(self):
        return PasswordResetForm
    
    def get_email_options(self):
        return {
            "email_template_name": "email_password_reset",
            "base_url": settings.FRONTEND_URL,
            "url_path": settings.FRONTEND_PASSWORD_RESET_PATH,
        }


class PasswordResetKeyValidSerializer(serializers.Serializer):
    """
    Serializer for confirming a password reset token validity.
    """
    uid = serializers.CharField()
    token = serializers.CharField()

    _errors = {}
    user = None
    set_password_form = None

    def validate(self, attrs):
        if 'allauth' in settings.INSTALLED_APPS:
            from allauth.account.forms import default_token_generator
            from allauth.account.utils import url_str_to_user_pk as uid_decoder
        else:
            from django.contrib.auth.tokens import default_token_generator
            from django.utils.http import urlsafe_base64_decode as uid_decoder

        # Decode the uidb64 (allauth use base36) to uid to get User object
        try:
            uid = force_str(uid_decoder(attrs['uid']))
            self.user = UserModel._default_manager.get(pk=uid)
        except (TypeError, ValueError, OverflowError, UserModel.DoesNotExist):
            raise ValidationError({'uid': ['Invalid value']})

        if not default_token_generator.check_token(self.user, attrs['token']):
            raise ValidationError({'token': ['Invalid value']})

        return attrs


class CustomRegisterSerializer(RegisterSerializer):
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    def get_cleaned_data(self):
        return {
            **super().get_cleaned_data(),
            "first_name": self.validated_data.get("first_name", ""),
            "last_name": self.validated_data.get("last_name", ""),
        }


class RegisterWithoutPasswordSerializer(RegisterSerializer):
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
    password1 = None
    password2 = None

    def validate(self, data):
        return data
    
    def validate_username(self, username):
        username = get_adapter().clean_username(username, True)
        return username
    
    def validate_email(self, email):
        email = get_adapter().clean_email(email)
        if allauth_account_settings.UNIQUE_EMAIL:
            if email and self.user_exists(email):
                raise serializers.ValidationError(
                    _("A user is already registered with this e-mail address."),
                )
        return email
    
    def user_exists(self, email, exclude_user=None):
        emailaddresses = EmailAddress.objects.exclude(verified=False)
        if exclude_user:
            emailaddresses = emailaddresses.exclude(user=exclude_user)
        return emailaddresses.filter(email__iexact=email, primary=True).exists()
    
    def get_cleaned_data(self):
        return {
            "username": self.validated_data.get("username", ""),
            "email": self.validated_data.get("email", ""),
            "first_name": self.validated_data.get("first_name", ""),
            "last_name": self.validated_data.get("last_name", ""),
        }
    
    def save(self, request):
        adapter = get_adapter()
        self.cleaned_data = self.get_cleaned_data()
        user = None
        is_new_user = False
        try:
            user = EmailAddress.objects.select_related("user").filter(email=self.cleaned_data["email"], primary=True, verified=False).first().user
        except AttributeError:
            user = adapter.new_user(request)
            is_new_user = True
        
        user = adapter.save_user(request, user, self, commit=False)
        user.save()
        self.custom_signup(request, user)
        if is_new_user:
            setup_user_email(request, user, [])
        return user
    

class RegisterWithoutPasswordConfirmSerializer(PasswordResetConfirmSerializer):
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)

    def custom_validation(self, attrs):
        first_name = attrs.get("first_name", None)
        last_name = attrs.get("last_name", None)
        if first_name:
            user_field(self.user, "first_name", first_name)
        if last_name:
            user_field(self.user, "last_name", last_name)

    def save(self):
        user = self.set_password_form.save()
        user.save()
        
        email_address = EmailAddress.objects.filter(email=user.email, primary=True, verified=False).first()
        email_address.verified = True
        email_address.save()


class GroupNameSerializer(serializers.ModelSerializer):

    class Meta:
        model = Group
        fields = ["name"]

    def to_representation(self, instance):
        return super().to_representation(instance).get("name")


class PermissionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Permission
        fields = ["codename"]

    def to_representation(self, instance):
        return super().to_representation(instance).get("codename")


class CustomUserDetailsSerializer(UserDetailsSerializer):
    roles = GroupNameSerializer(many=True, read_only=True, source="groups")
    permissions = PermissionSerializer(many=True, read_only=True, source="user_permissions")
    # permissions = serializers.SerializerMethodField()
    extra = serializers.SerializerMethodField()

    class Meta:
        model = UserModel
        fields = ["id", "email", "first_name", "last_name", "roles", "permissions", "extra"]
        read_only_fields = ["id", "email"]

    def get_permissions(self, obj):
        return obj.get_all_permissions()
    
    def get_extra(self, obj):
        try:
            social_account = SocialAccount.objects.get(user=obj, provider="google")
            return {
                "picture": social_account.extra_data["picture"],
            }
        except:
            return None

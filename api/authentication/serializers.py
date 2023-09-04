from allauth.account import app_settings as allauth_account_settings
from allauth.account.adapter import get_adapter
from allauth.socialaccount.models import SocialAccount
from allauth.utils import email_address_exists
from dj_rest_auth.registration.serializers import RegisterSerializer
from dj_rest_auth.serializers import PasswordResetSerializer, UserDetailsSerializer
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

    def custom_signup(self, request, user):
        user_first_name = self.validated_data.get('first_name', '')
        user_last_name = self.validated_data.get('last_name', '')

        user.first_name = user_first_name
        user.last_name = user_last_name
        user.save()


class GroupSerializer(serializers.ModelSerializer):

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
    roles = GroupSerializer(many=True, read_only=True, source="groups")
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

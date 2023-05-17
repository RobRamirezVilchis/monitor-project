from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils.encoding import force_str
from django.utils.translation import gettext_lazy as _
from allauth.account import app_settings as allauth_account_settings
from allauth.account.adapter import get_adapter
from allauth.utils import email_address_exists
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from dj_rest_auth.serializers import PasswordResetSerializer, UserDetailsSerializer
from dj_rest_auth.registration.serializers import RegisterSerializer

from .forms import PasswordResetForm

class CustomPasswordResetSerializer(PasswordResetSerializer):
    @property
    def password_reset_form_class(self):
        return PasswordResetForm


UserModel = get_user_model()

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
    

class CustomUserDetailsSerializer(UserDetailsSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = UserModel
        fields = ["email", "first_name", "last_name", "role"]
        read_only_fields = ["email", "role"]

    def get_role(self, obj):
        return "None"

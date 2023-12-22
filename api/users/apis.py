from allauth.account import signals
from allauth.account.models import EmailAddress
from django.conf import settings
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db.models import Prefetch
from django.utils import timezone
from rest_framework import status, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api.pagination import get_paginated_response
from authentication.serializers import GroupNameSerializer, RegisterWithoutPasswordSerializer
from authentication.forms import PasswordResetForm
from common.utils import inline_serializer

from . import listeners #? Necessary to register the listeners
from .models import UserWhitelist
from .permissions import UsersPermissions, UsersWhitelistPermissions, UserAccessPermissions, UserRolesPermissions
from .services import UsersService, UserAccessService, UserRolesService, UserWhitelistService
from .serializers import CommonUserSerializer


User = get_user_model()

class UsersListApi(APIView):
    permission_classes = [IsAuthenticated, UsersPermissions]

    class FiltersSerializer(serializers.Serializer):
        search = serializers.CharField(max_length=254, required=False)
        sort = serializers.CharField(max_length=254, required=False)

    class OutputSerializer(serializers.Serializer):
        id = serializers.IntegerField()
        email = serializers.EmailField()
        first_name = serializers.CharField()
        last_name = serializers.CharField()
        roles = GroupNameSerializer(many=True, source="groups")
        verified = serializers.SerializerMethodField()

        def get_verified(self, obj):
            try:
                return obj.emailaddress_set.all()[0].verified
            except IndexError:
                return False

    def get(self, request, *args, **kwargs):
        """
        Returns a list of users.
        """
        filters_serializer = self.FiltersSerializer(data=request.query_params)
        filters_serializer.is_valid(raise_exception=True)
        qs = UsersService.list(
            filters=filters_serializer.validated_data, 
            prefetch_related=[
                "groups",
                Prefetch(
                    "emailaddress_set",
                    queryset=EmailAddress.objects.filter(primary=True),
                )
            ]
        )
        return get_paginated_response(
            queryset         = qs,
            serializer_class = self.OutputSerializer,
            request          = request,
        )
    
    class CreatePartialInputSerializer(serializers.Serializer):
        send_email = serializers.BooleanField(default=True)
        roles = serializers.ListField(
            child=serializers.CharField(max_length=150),
            required=False,
        )
        # Other fields are managed by the RegisterWithoutPasswordSerializer

        def validate_roles(self, value):
            if not all(role in UserRolesService.values for role in value):
                raise serializers.ValidationError("Invalid roles")
            return value


    def post(self, request, *args, **kwargs):
        """
        Creates a user without password and optionally send an email to 
        reset the password and confirm the email.
        If a user is already registered with the email, new tokens are generated
        Param:
            - username    : str
            - email       : str
            - first_name  : (optional) str
            - last_name   : (optional) str
            - roles       : (optional) list[str]

            - send_mail: (optional) bool, default=True
        """
        serializer = RegisterWithoutPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        other_serializer = self.CreatePartialInputSerializer(data=request.data)
        other_serializer.is_valid(raise_exception=True)
        user = serializer.save(self.request)
        send_mail = other_serializer.validated_data.pop("send_mail", True)
        service = UsersService(user)
        user = service.update(other_serializer.validated_data)
        signals.user_signed_up.send(sender=user.__class__, request=request, user=user)

        # Send confirmation e-mail with password reset link
        if 'allauth' in settings.INSTALLED_APPS:
            from allauth.account.forms import default_token_generator
        else:
            from django.contrib.auth.tokens import default_token_generator
        reset_form = PasswordResetForm(data={"email": user.email})
        if not reset_form.is_valid():
            raise serializers.ValidationError(reset_form.errors)
        opts = {
            "use_https": request.is_secure(),
            "from_email": getattr(settings, "DEFAULT_FROM_EMAIL"),
            "request": request,
            "token_generator": default_token_generator,

            "email_template_name": "email_register_password_reset",
            "base_url": settings.FRONTEND_URL,
            "url_path":  settings.FRONTEND_REGISTER_PASSWORD_RESET_PATH,

            "send_email": send_mail,
        }

        if send_mail:
            reset_form.save(**opts)
            return Response(
                { "detail": "User confirmation e-mail sent." }, 
                status=status.HTTP_201_CREATED
            )
        else:
            email, tokens = reset_form.save(**opts)
            return Response(
                { "detail": "User confirmation e-mail sent.", "tokens": tokens }, 
                status=status.HTTP_201_CREATED
            )
    

class UsersDetailApi(APIView):
    permission_classes = [IsAuthenticated, UsersPermissions]
    
    class UpdateInputSerializer(serializers.Serializer):
        first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
        last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
        roles = serializers.ListField(
            child=serializers.CharField(max_length=150),
            required=False,
        )

        def validate_roles(self, value):
            if not all(role in UserRolesService.values for role in value):
                raise serializers.ValidationError("Invalid roles")
            return value
        
    class OutputSerializer(serializers.Serializer):
        id = serializers.IntegerField()
        email = serializers.EmailField()
        first_name = serializers.CharField()
        last_name = serializers.CharField()
        roles = GroupNameSerializer(many=True, source="groups")

    def patch(self, request, pk = None, *args, **kwargs):
        """
        Updates a user.
        """
        user = get_object_or_404(User, pk=pk)
        serializer = self.UpdateInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        service = UsersService(user)
        user = service.update(serializer.validated_data)
        return Response(self.OutputSerializer(user).data, status=status.HTTP_200_OK)
    
    def delete(self, request, pk = None, *args, **kwargs):
        """
        Deletes a user.
        """
        user = get_object_or_404(User, pk=pk)
        service = UsersService(user)
        service.soft_delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserRolesListApi(APIView):
    permission_classes = [IsAuthenticated, UserRolesPermissions]

    def get(self, request, *args, **kwargs):
        groups = UserRolesService.list_as_groups()
        serializer = GroupNameSerializer(groups, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UsersWhitelistListApi(APIView):
    permission_classes = [IsAuthenticated, UsersWhitelistPermissions]

    class FilterSerializer(serializers.Serializer):
        search = serializers.CharField(max_length=254, required=False)
        sort = serializers.CharField(max_length=254, required=False)

    class OutputSerializer(serializers.Serializer):
        id = serializers.IntegerField(required=True)
        email = serializers.EmailField(max_length=254, required=True)
        group = serializers.CharField(max_length=254, required=True)
        user = CommonUserSerializer(required=False, read_only=True)

    def get(self, request, *args, **kwargs):
        """
        Returns a list of whitelisted users.
        """
        filters_serializer = self.FilterSerializer(data=request.query_params)
        filters_serializer.is_valid(raise_exception=True)
        qs = UserWhitelistService.list(filters=filters_serializer.validated_data)
        return get_paginated_response(
            queryset         = qs,
            serializer_class = self.OutputSerializer,
            request          = request,
        )
    
    class CreateInputSerializer(serializers.Serializer):
        email = serializers.EmailField(max_length=254, required=True)
        group = serializers.CharField(max_length=254, required=True)

        def validate_group(self, value):
            if value not in UserRolesService.values:
                raise serializers.ValidationError("Invalid group")
            return value

    def post(self, request, *args, **kwargs):
        serializer = self.CreateInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = UserWhitelistService.create(serializer.validated_data)
        return Response(self.OutputSerializer(user).data, status=status.HTTP_201_CREATED)


class UsersWhitelistDetailApi(APIView):
    permission_classes = [IsAuthenticated, UsersWhitelistPermissions]
    
    class UpdateInputSerializer(serializers.Serializer):
        email = serializers.EmailField(max_length=254, required=False)
        group = serializers.CharField(max_length=254, required=False)

        def validate_group(self, value):
            if value not in UserRolesService.values:
                raise serializers.ValidationError("Invalid group")
            return value

    class OutputSerializer(serializers.Serializer):
        id = serializers.IntegerField(required=True)
        email = serializers.EmailField(max_length=254)
        group = serializers.CharField(max_length=254)
        user = CommonUserSerializer(required=False, read_only=True)

    def patch(self, request, pk = None, *args, **kwargs):
        whitelist_instance = get_object_or_404(UserWhitelist, pk=pk)
        serializer = self.UpdateInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = UserWhitelistService.update(whitelist_instance, serializer.validated_data)
        return Response(self.OutputSerializer(user).data, status=status.HTTP_200_OK)
    
    def delete(self, request, pk = None, *args, **kwargs):
        whitelist_instance = get_object_or_404(UserWhitelist, pk=pk)
        UserWhitelistService.delete(
            whitelist_instance, 
            current_user = request.user, 
            throw_if_self_delete = True
        )
        return Response(status=status.HTTP_204_NO_CONTENT)
    

class UserAccessListApi(APIView):
    permission_classes = [IsAuthenticated, UserAccessPermissions]

    class FilterSerializer(serializers.Serializer):
        start_date = serializers.DateTimeField(required=False)
        end_date = serializers.DateTimeField(required=False)
        search = serializers.CharField(max_length=254, required=False)
        sort = serializers.CharField(max_length=254, required=False)

    class OutputSerializer(serializers.Serializer):
        id = serializers.IntegerField(source="user.id")
        user = CommonUserSerializer()
        last_access = serializers.DateTimeField(default_timezone=timezone.utc)
        access = serializers.IntegerField()

    def get(self, request, *args, **kwargs):
        filters_serializer = self.FilterSerializer(data=request.query_params)
        filters_serializer.is_valid(raise_exception=True)
        qs = UserAccessService.list_grouped(filters=filters_serializer.validated_data)
        qs = UsersService.replace_user_ids(qs, prefetch_social_accounts=True)
        return get_paginated_response(
            queryset         = qs,
            serializer_class = self.OutputSerializer,
            request          = request,
        )

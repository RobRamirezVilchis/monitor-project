from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from common.pagination import get_paginated_response

from . import listeners #? Necessary to register the listeners
from .enums import user_roles
from .models import UserWhitelist
from .services import UserService, UserAccessService, UserWhitelistService
from .serializers import CommonUserSerializer


class UsersWhitelistListApi(APIView):

    class FilterSerializer(serializers.Serializer):
        search = serializers.CharField(max_length=254, required=False)
        sort = serializers.CharField(max_length=254, required=False)

    class OutputSerializer(serializers.Serializer):
        id = serializers.IntegerField(required=True)
        email = serializers.EmailField(max_length=254, required=True)
        group = serializers.CharField(max_length=254, required=True)
        user = CommonUserSerializer(required=False, read_only=True)

    def get(self, request, *args, **kwargs):
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
            if value not in user_roles:
                raise serializers.ValidationError("Invalid group")
            return value

    def post(self, request, *args, **kwargs):
        serializer = self.CreateInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = UserWhitelistService.create(serializer.validated_data)
        return Response(self.OutputSerializer(user).data, status=status.HTTP_201_CREATED)

class UsersWhitelistDetailApi(APIView):
    
    class UpdateInputSerializer(serializers.Serializer):
        email = serializers.EmailField(max_length=254, required=True)
        group = serializers.CharField(max_length=254, required=True)

        def validate_group(self, value):
            if value not in user_roles:
                raise serializers.ValidationError("Invalid group")
            return value

    class OutputSerializer(serializers.Serializer):
        id = serializers.IntegerField(required=True)
        email = serializers.EmailField(max_length=254, required=True)
        group = serializers.CharField(max_length=254, required=True)
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
        qs = UserService.replace_user_ids(qs, prefetch_social_accounts=True)
        return get_paginated_response(
            queryset         = qs,
            serializer_class = self.OutputSerializer,
            request          = request,
        )

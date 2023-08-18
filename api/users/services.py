from allauth.socialaccount.models import SocialAccount
from datetime import datetime
from django.db import transaction
from django.db.models import Prefetch, Count, Max
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from rest_framework import exceptions

from authentication.services import user_soft_delete

from .enums import user_roles
from .filters import UserAccessLogFilter, UserWhitelistFilter
from .models import UserAccessLog, UserWhitelist


User = get_user_model()

class UserService:
    
    @classmethod
    def get_active(cls, *args, **kwargs):
        return User.objects.get(*args, **kwargs, is_active=True)
    
    @classmethod
    def get_all_active(cls):
        return User.objects.filter(is_active=True).all()

    @classmethod
    @transaction.atomic
    def soft_delete(cls, user):
        whitelist_instance = UserWhitelistService.get_by_email(user.email)
        if whitelist_instance:
            # Remove user from the whitelist object associated, but do not delete the whitelist object
            whitelist_instance.user = None
            whitelist_instance.save()
        return user_soft_delete(user)
    
    @classmethod
    def replace_user_ids(cls, objects_list, prefetch_social_accounts=False):
        """
        Replaces the user_id in the objects_list with the user object
        """
        user_ids = [
            log.__dict__["user_id"] if hasattr(log, "__dict__") else log["user_id"]
            for log in objects_list
        ]
        users = User.objects.filter(id__in=user_ids)
        if prefetch_social_accounts:
            users = users.prefetch_related(
                Prefetch(
                    "socialaccount_set",
                    queryset=SocialAccount.objects.filter(provider="google"),
                )
            )
        users = {
            user.id: user 
            for user in users
        }
        for log in objects_list:
            if hasattr(log, "__dict__"):
                log = log.__dict__
            log["user"] = users.get(log["user_id"], None)

        return objects_list


class UserWhitelistService:

    @classmethod
    def get_by_email(cls, email):
        try:
            return UserWhitelist.objects.get(email=email)
        except UserWhitelist.DoesNotExist:
            return None

    @classmethod
    def is_email_whitelisted(cls, email):
        try:
            UserWhitelist.objects.get(email=email)
            return True
        except UserWhitelist.DoesNotExist:
            return False
        
    @classmethod
    def list(cls, filters = None):
        qs = UserWhitelist.objects.select_related("group", "user").prefetch_related(
            Prefetch(
                "user__socialaccount_set",
                queryset=SocialAccount.objects.filter(provider="google"),
            )
        ).order_by("id").all()

        if filters:
            qs = UserWhitelistFilter(filters, qs).qs

        return qs

    @classmethod
    @transaction.atomic
    def create(cls, data):
        email_str = data["email"]
        group_str = data["group"]

        if cls.is_email_whitelisted(email_str):
            raise exceptions.ValidationError({
                "email": exceptions.ErrorDetail("Email already exists in whitelist.", code="unique")
            })

        try:
            user = User.objects.get(email=email_str, is_active=True)
        except User.DoesNotExist:
            user = None

        group = Group.objects.get(name=group_str)

        if user:
            to_delete_group_names = [group_name for group_name in user_roles if group_name != group_str]
            to_delete_groups = user.groups.filter(name__in=to_delete_group_names).all()
            # Remove the user from all existing groups
            for to_delete_group in to_delete_groups:
                user.groups.remove(to_delete_group)

            # Add the user to the new group if it is not already in it
            if not user.groups.filter(name=group_str).exists():
                user.groups.add(group)

        return UserWhitelist.objects.create(
            email = email_str, 
            group = group,
            user = user
        )
    
    @classmethod
    @transaction.atomic
    def update(cls, whitelist_instance, data):
        email_str = data.get("email", whitelist_instance.email)
        group_str = data.get("group", whitelist_instance.group)

        # If email changed, delete the old user and create a new one if the email is not already registered
        if email_str != whitelist_instance.email:
            if cls.is_email_whitelisted(email_str):
                raise exceptions.ValidationError({
                    "email": exceptions.ErrorDetail("Email already exists in whitelist.", code="unique")
                })
            
            if whitelist_instance.user and whitelist_instance.user.email == whitelist_instance.email:
                user_soft_delete(whitelist_instance.user)
                whitelist_instance.user = None
        
        try:
            user = User.objects.get(email=email_str, is_active=True)
        except User.DoesNotExist:
            user = None

        group = Group.objects.get(name=group_str)

        if user:
            to_delete_group_names = [group_name for group_name in user_roles if group_name != group_str]
            to_delete_groups = user.groups.filter(name__in=to_delete_group_names).all()
            # Remove the user from all existing groups
            for to_delete_group in to_delete_groups:
                user.groups.remove(to_delete_group)

            # Add the user to the new group if it is not already in it
            if not user.groups.filter(name=group_str).exists():
                user.groups.add(group)
       
        whitelist_instance.email = email_str
        whitelist_instance.group = group
        whitelist_instance.save()
        return whitelist_instance
    

    @classmethod
    @transaction.atomic
    def delete(cls, whitelist_instance, current_user = None, throw_if_self_delete = False):
        if throw_if_self_delete and current_user == whitelist_instance.user:
            raise exceptions.PermissionDenied(detail="You cannot delete your own account.")

        if whitelist_instance.user:
            user_soft_delete(whitelist_instance.user)

        return whitelist_instance.delete()


class UserAccessService:

    @classmethod
    def list_grouped(cls, filters = None):
        """
        List all access logs for a user and apply filters if context is provided
        """
        qs = UserAccessLog.objects.values(
            "user_id"
        ).filter(user__is_active=True).all().annotate(
            last_access=Max("created_at"),
            access=Count("user_id")
        ).order_by()

        if filters:
            qs = UserAccessLogFilter(filters, qs).qs

        return qs
    
    @classmethod
    def has_access_today(cls, user):
        return UserAccessLog.objects.filter(
            user=user, 
            created_at=datetime.now().date()
        ).exists()

    @classmethod
    def log_access(cls, user):
        if not cls.has_access_today(user):
            UserAccessLog.objects.create(user=user)

from typing import Union, List
from rest_framework.response import Response
from rest_framework import exceptions
import inspect

from django.contrib.auth.models import AnonymousUser

def method_permission_classes(classes):
    '''
        Permission classes for each method in addition to the class level permission_classes
    '''
    def decorator(func):
        def decorated_func(self, *args, **kwargs):
            self.permission_classes = classes
            # this call is needed for request permissions
            self.check_permissions(self.request)
            return func(self, *args, **kwargs)
        return decorated_func
    return decorator


def permission_required(permission: Union[str, List[str]]):
    """
    Decorator to check model permissions for a view, view action
    or api view function.
    Accepts a permission string or a list of string permissions in 
    the format of <app_label>.<permission_codename> and checks if 
    the user has the required model permissions to perform the action.
    """
    if isinstance(permission, str):
        permissions = [permission]
    else:
        permissions = permission

    def decorator(arg):
        if inspect.isfunction(arg):
            def decorated_func(*args, **kwargs):
                user = None
                for x in args:
                    if hasattr(x, "user"):
                        user = x.user
                        break
                    if hasattr(x, "request"):
                        user = x.request.user
                        break
                if not user:
                    raise exceptions.NotAuthenticated()
                if not user.has_perms(permissions):
                    raise exceptions.PermissionDenied()
                return arg(*args, **kwargs)
            return decorated_func

        if inspect.isclass(arg):
            class DecoratedClass(arg):
                def check_permissions(self, request):
                    if isinstance(request.user, AnonymousUser):
                        raise exceptions.NotAuthenticated()
                    if not request.user.has_perms(permissions):
                        raise exceptions.PermissionDenied()
                    return super().check_permissions(request)
            return DecoratedClass

        return arg
    return decorator

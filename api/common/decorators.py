from django.contrib.auth.models import AnonymousUser
from rest_framework import exceptions
from typing import Union, List
import inspect


def map_actions(actions_map = {}, crud = False, detail = False):
    """
    Map ApiView methods (get,post,...) to an action and set the view.action attribute
    
    If list = True, prepend crud action names:
    - `get`   : list
    - `post`  : create
    - `put`   : update
    - `patch` : partial-update
    - `delete`: destroy
    
    if detail = True, override crud action name for the `get` method:
    - `get`   : retrieve
    """
    if crud:
        actions_map = {
            "get"   : "list",
            "post"  : "create",
            "put"   : "update",
            "patch" : "partial-update",
            "delete": "destroy",

            **actions_map
        }

    if detail:
        actions_map["get"] = "retrieve"

    def decorator(args):
        class DecoratedClass(args):
            def check_permissions(self, request):
                action = actions_map.get(request.method.lower(), None)
                if action:
                    self.action = action
                return super().check_permissions(request)
        return DecoratedClass
    
    return decorator


def action_permission_classes(classes):
    """
    Permission classes for view actions in addition to the view permission_classes
    """
    def decorator(func):
        def decorated_func(self, *args, **kwargs):
            original_permission_classes = self.permission_classes
            self.permission_classes = classes
            self.check_permissions(self.request)
            # Append the original permission classes back after checking in case
            # they must be used in the view action
            self.permission_classes = original_permission_classes + classes
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

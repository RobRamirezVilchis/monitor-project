from django.contrib.auth import get_user_model
from django.core.exceptions import ImproperlyConfigured
from guardian.shortcuts import get_anonymous_user
from rest_framework.permissions import BasePermission
from typing import Union, List, Optional, Callable, Any
import sys
if sys.version_info < (3, 11):
    from typing_extensions import TypedDict, NotRequired
else:
    from typing import TypedDict, NotRequired

User = get_user_model()

Condition = Callable[[User, str, Optional[Any], Any, Any], bool]


class Policy(TypedDict):
    '''
    - action (required): A string or a list of strings that represents the action(s) that
                the user is trying to perform.  
                The action can be a view action name or a request method name
                when the action is not defined in the view.
                Passing a wild card ("*" or ["*"]) will match any action.
    - permission (required): A string or a list of strings that represents the permission(s)
                    that the user must have to perform the action(s).
                    Passing a wild card ("*" or ["*"]) will mark that policy
                    permissions as granted.
    - group: An optional string or a list of strings that represents the group(s)
                that the user must belong to in order to perform the action(s).
    - conditions: An optional list of callables that will be checked to grant
                    the permission. A condition accepts the following parameters:
                    - user: The user that is trying to perform the action.
                    - action: The view action or request method.
                    - obj: The object that the user is trying to access (for object
                            level permissions).
                    - request: The request object.
                    - view: The view object.
    '''
    action:     Union[str, List[str]]
    permission: Union[str, List[str]]
    group:      NotRequired[Union[str, List[str]]]
    conditions: NotRequired[List[Condition]]


class PolicyPermissions(BasePermission):
    """
    A permission class that checks if the user has the required permissions
    to perform the action on the view or object.

    Either policies or object_policies should be set in order to check the permissions.
    If any policy list is None, the permission will be granted for that policy level.
    If a policy list is not None, the access for all actions in the view will
    be denied by default, so policy rules must be set explicitly for each action.

    - policies: A list of policies that will be used to check the model permissions.
    - object_policies: A list of policies that will be used to check the permissions
                       for the object.
    """
    policies:        Optional[List[Policy]] = None
    object_policies: Optional[List[Policy]] = None

    class RequiredPermissions:
        def __init__(self, permissions: List[str], groups: List[str], conditions: List[Condition]):
            self.permissions = permissions
            self.groups = groups
            self.conditions = conditions

    def set_view_permissions(self, view, required_permissions: RequiredPermissions):
        """
        Set the current view permissions to the view object.
        Useful if the view needs to know the permissions that are required
        by the current action.
        If the required_permissions are None, the view will be marked as access denied.
        """
        pass

    def has_permission(self, request, view) -> bool:
        if self.policies is None: return True
        if not self.policies: return False
        return self.check_permissions(self.policies, request, view)

    def has_object_permission(self, request, view, obj) -> bool:
        if self.object_policies is None: return True
        if not self.object_policies: return False
        return self.check_permissions(self.object_policies, request, view, obj)

    def check_permissions(self, policies: List[Policy], request, view, obj = None) -> bool:
        user = request.user
        if user.is_anonymous:
            user = get_anonymous_user()
        method = request.method
        action = self.get_action_or_method(request, view)

        required_permissions = self.get_required_permissions(action, method, policies)
        self.set_view_permissions(view, required_permissions)
        
        if required_permissions is None: 
            return False
        
        has_permissions = user.has_perms(required_permissions.permissions, obj)
        has_groups = len(required_permissions.groups) == 0 or user.groups.filter(name__in=required_permissions.groups).count() == len(required_permissions.groups)
        conditions_passed = all([condition(user, action, obj, request, view) for condition in required_permissions.conditions])

        return has_permissions and has_groups and conditions_passed
    
    def get_required_permissions(self, action: str, method: str, policies: List[Policy]) -> Optional[RequiredPermissions]:
        """
        Return an instance of RequiredPermissions with the permissions, groups and conditions for the given action/method.
        If no permissions are matched for the action, the result is None, which means that the access will be denied.
        """
        action = action.upper()
        method = method.upper()
        permissions: List[str] = []
        groups: List[str] = []
        conditions: List[Condition] = []
        permissions_wild_card = False
        
        for policy in policies:
            policy_action = policy.get("action", None)
            policy_permission = policy.get("permission", None)
            policy_group = policy.get("group", None)
            policy_conditions = policy.get("conditions", None)
            
            if not policy_action:
                raise ImproperlyConfigured("'action' is required.")
            
            if not policy_permission:
                raise ImproperlyConfigured("'permission' is required.")

            action_match = False

            if policy_action == "*" or policy_action == ["*"]:
                action_match = True
            elif isinstance(policy_action, str):
                policy_action = policy_action.upper()
                action_match = action == policy_action or method == policy_action
            elif isinstance(policy_action, List):
                policy_action = [x.upper() for x in policy_action]
                action_match = (action in policy_action) or (method in policy_action)
            else:
                raise ImproperlyConfigured("Required 'action' to be a string or a list of strings. Type %s was given." % type(policy_action).__name__)

            if not action_match: continue
            
            if policy_permission == "*" or policy_permission == ["*"]:
                permissions_wild_card = True
            elif isinstance(policy_permission, str):
                permissions.append(policy_permission)
            elif isinstance(policy_permission, List):
                permissions += policy_permission
            else:
                raise ImproperlyConfigured("Required 'permission' must be a string or a list of strings. Type %s was given." % type(policy_permission).__name__)
            
            if policy_group:
                if isinstance(policy_group, str):
                    groups.append(policy_group)
                elif isinstance(policy_group, List):
                    groups += policy_group
                else:
                    raise ImproperlyConfigured("Required 'group' must be a string or a list of strings. Type %s was given." % type(policy_group).__name__)
            
            if policy_conditions:
                conditions += policy_conditions

        if len(permissions) > 0 or permissions_wild_card:
            return self.RequiredPermissions(permissions, groups, conditions)

        return None

    def get_action(self, request, view) -> Optional[str]:
        if hasattr(view, "action"):
            if hasattr(view, "action_map"):
                return view.action or view.action_map[request.method]
            return view.action
        
        return None
    
    def get_action_or_method(self, request, view) -> str:
        action = self.get_action(request, view)
        return action or request.method

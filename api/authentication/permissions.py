from typing import Union, TypedDict, List, Optional, Callable, Tuple
from rest_framework.permissions import BasePermission
from django.core.exceptions import ImproperlyConfigured
from django.contrib.auth import get_user_model
from guardian.shortcuts import get_anonymous_user

User = get_user_model()

Condition = Callable[[User, str, Optional[any], any, any], bool]

class Policy(TypedDict):
    action: Union[str, List[str]]
    permission: Union[str, List[str]]
    conditions: Optional[List[Condition]]


class PolicyPermissions(BasePermission):
    """
    A permission class that checks if the user has the required permissions
    to perform the action on the view or object.

    Either policies or object_policies should be set in order to check the permissions.
    If any policy list is None, the permission will be granted for that policy level.
    If a policy list is set to a list, all actions in the view will be marked as access
    denied by default, so policy rules must be set explicitly for each action.

    - policies: A list of policies that will be used to check the model permissions.
    - object_policies: A list of policies that will be used to check the permissions
                       for the object.

    A policy is a dictionary with the following attributes:
    - action: A string or a list of strings that represents the action(s) that
              the user is trying to perform. 
              The action can be a view action name or a request method name
              when the action is not defined in the view.
              Passing a wild card ("*" or ["*"]) will match any action.
    - permission: A string or a list of strings that represents the permission(s)
                  that the user must have to perform the action(s).
                  Passing a wild card ("*" or ["*"]) will mark that policy
                  permissions as granted.
    - conditions: An optional list of callables that will be checked to grant
                  the permission. A condition accepts the following parameters:
                  - user: The user that is trying to perform the action.
                  - action: The view action or request method.
                  - obj: The object that the user is trying to access (for object 
                         level permissions).
                  - request: The request object.
                  - view: The view object.

    The permission class will check that the user has all the permissions matched
    and that all the conditions matched return True in order to grant access. 
    """
    policies:        Optional[List[Policy]] = None
    object_policies: Optional[List[Policy]] = None

    def set_view_permissions(self, view, permissions: Optional[List[str]]):
        """
        Set the current view permissions to the view object.
        Useful if the view needs to know the permissions that are required
        by the current action.
        If the permissions are None, the view will be marked as access denied.
        If the permissions are an empty list, the view will be marked as access granted.
        If the permissions are a list of permissions, the view will be marked as access granted
        only if the user has all the permissions in the list.
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

        required_permissions, conditions = self.get_required_permissions(action, method, policies)
        self.set_view_permissions(view, required_permissions)
        if required_permissions is None: return False
        return user.has_perms(required_permissions, obj) \
            and all([condition(user, action, obj, request, view) for condition in conditions])
    
    def get_required_permissions(self, action: str, method: str, policies: List[Policy]) -> Union[Tuple[List[str], List[Condition]], Tuple[None, None]]:
        """
        Return a tuple with the required permissions and conditions for the given action.
        If no permissions are matched for the action, the tuple will be (None, None).
        If the permissions are None, the view will be marked as access denied.
        If the permissions are an empty list, the view will be marked as access granted.
        If the permissions are a list of permissions, the view will be marked as access granted
        only if the user has all the permissions in the list.
        """
        action = action.upper()
        method = method.upper()
        permissions: List[str] = []
        conditions: List[Condition] = []
        wild_card = False
        
        for policy in policies:
            policy_action: Optional[Union[str, List[str]]] = policy.get("action", None)
            policy_permission: Optional[Union[str, List[str]]] = policy.get("permission", None)
            policy_conditions: Optional[List[Condition]] = policy.get("conditions", None)
            
            if not policy_action or not policy_permission:
                raise ImproperlyConfigured("Required both 'action' and 'permission'.")

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
                wild_card = True
            elif isinstance(policy_permission, str):
                permissions.append(policy_permission)
            elif isinstance(policy_permission, List):
                permissions += policy_permission
            else:
                raise ImproperlyConfigured("Required 'permission' must be a string or a list of strings. Type %s was given." % type(policy_permission).__name__)
            
            if policy_conditions:
                conditions += policy_conditions

        return (permissions, conditions) if len(permissions) > 0 or wild_card else (None, None)

    def get_action(self, request, view) -> Optional[str]:
        if hasattr(view, "action"):
            if hasattr(view, "action_map"):
                return view.action or view.action_map[request.method]
            return view.action
        
        return None
    
    def get_action_or_method(self, request, view) -> str:
        action = self.get_action(request, view)
        return action or request.method

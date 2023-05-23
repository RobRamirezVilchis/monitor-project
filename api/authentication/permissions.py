from typing import Union, TypedDict, List, Literal, Optional
from rest_framework.permissions import BasePermission

class Policy(TypedDict):
    action: Union[str, List[str]]
    permission: Union[str, List[str]]


class PolicyPermission(BasePermission):
    """
    A permission class that checks if the user has the required permissions
    to perform the action on the view or object.

    Either policies or object_policies should be set in order to check the permissions.
    If any policy list is None, the permission will be granted for that policy level.
    If a policy list is set to a list, all actions in the view will be marked as access
    denied by default, so policy rules must be set explicitly for each action.

    - policies: A list of policies that will be used to check the permissions
                for the view.
    - object_policies: A list of policies that will be used to check the permissions
                for the object.

    A policy is a dictionary with the following attributes:
    - action: A string or a list of strings that represents the action(s) that
                the user is trying to perform. 
                The action can be a request method name, a view action name,
                or a function name for function based views.
                Passing a wild card ("*" or ["*"]) will match any action.
    - permission: A string or a list of strings that represents the permission(s)
                that the user must have to perform the action(s).
                Passing a wild card ("*" or ["*"]) will mark that policy
                permissions as granted.

    The permission class will check that the user has all the permissions matched
    by action in the policy list. If the user has the required permissions, the
    permission class will return True, otherwise it will return False.
    """
    policies:        Optional[List[Policy]] = None
    object_policies: Optional[List[Policy]] = None

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
        method = request.method
        action = self.get_action_or_method(request, view)

        required_permissions = self.get_required_permissions(action, method, policies)
        if required_permissions is None: return False
        return user.has_perms(required_permissions, obj)
    
    def get_required_permissions(self, action: str, method: str, policies: List[Policy]) -> Optional[List[str]]:       
        action = action.upper()
        method = method.upper()
        permissions: List[str] = []
        wild_card = False
        
        for policy in policies:
            policy_action: Optional[Union[str, List[str]]] = policy.get("action", None)
            policy_permission: Optional[Union[str, List[str]]] = policy.get("permission", None)
            
            if not policy_action or not policy_permission:
                raise Exception("Invalid value: Both action and permission attributes values must be set.")

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
                raise Exception("Invalid value: action must be a string or a list of strings.")

            if not action_match: continue
            
            if policy_permission == "*" or policy_permission == ["*"]:
                wild_card = True
            elif isinstance(policy_permission, str):
                permissions.append(policy_permission)
            elif isinstance(policy_permission, List):
                permissions += policy_permission
            else:
                raise Exception("Invalid value: permission must be a string or a list of strings.")

        return permissions if len(permissions) > 0 or wild_card else None

    def get_action(self, request, view) -> Optional[str]:
        if hasattr(view, "action"):
            if hasattr(view, "action_map"):
                return view.action or view.action_map[request.method]
            return view.action
        # For function api_view:
        elif hasattr(view, "__class__"):
            return view.__class__.__name__
        
        return None
    
    def get_action_or_method(self, request, view) -> str:
        action = self.get_action(request, view)
        return action or request.method

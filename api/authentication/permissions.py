from typing import Union, TypedDict, List, Literal, Optional
from rest_framework.permissions import BasePermission

class Policy(TypedDict):
    action: Union[str, List[str]]
    permission: Union[str, List[str]]


class PolicyPermission(BasePermission):
    policies:        List[Policy] = []
    object_policies: List[Policy] = []

    def has_permission(self, request, view) -> bool:
        return self.check_permissions(self.policies, request, view)

    def has_object_permission(self, request, view, obj) -> bool:
        return self.check_permissions(self.object_policies, request, view, obj)

    def check_permissions(self, policies: List[Policy], request, view, obj = None) -> bool:
        user = request.user
        method = request.method
        action = self.get_action_or_method(request, view)

        required_permissions = self.get_required_permissions(action, method, policies)
        return user.has_perms(required_permissions, obj)
    
    def get_required_permissions(self, action: str, method: str, policies: List[Policy]) -> List[str]:
        if len(policies) == 0:
            raise Exception("Invalid value: Policies cannot be empty.")
        
        action = action.upper()
        method = method.upper()
        permissions: List[str] = []
        
        for policy in policies:
            policy_action: Optional[Union[str, List[str]]] = policy.get("action", None)
            policy_permission: Optional[Union[str, List[str]]] = policy.get("permission", None)
            
            if not policy_action or not policy_permission \
                or (isinstance(policy_action, List) and len(policy_action) == 0) \
                or (isinstance(policy_permission, List) and len(policy_permission) == 0):
                raise Exception("Invalid value: Both action and permission attributes must be set.")

            action_match = False

            if isinstance(policy_action, str):
                if policy_action == "*":
                    action_match = True
                else:
                    policy_action = policy_action.upper()
                    action_match = action == policy_action or method == policy_action
            elif isinstance(policy_action, List):
                policy_action = [x.upper() for x in policy_action]
                action_match = (action in policy_action) or (method in policy_action)
            else:
                raise Exception("Invalid value: action must be a string or a list of strings.")

            if not action_match: continue
            
            if isinstance(policy_permission, str):
                if policy_permission == "*": continue
                permissions.append(policy_permission)
            elif isinstance(policy_permission, List):
                permissions += policy_permission
            else:
                raise Exception("Invalid value: permission must be a string or a list of strings.")
    
        return permissions

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

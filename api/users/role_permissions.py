from typing_extensions import List, Dict, Tuple
from django.contrib.auth import get_user_model

from .enums import UserRoles

User = get_user_model()

RolePermission = Tuple[str, str] # (app.model, codename)

RolePermissions = Dict[UserRoles, List[RolePermission]]

role_permissions: RolePermissions = {
    UserRoles.Admin: [
        ("authentication.User", "view_user"),
        ("authentication.User", "add_user"),
        ("authentication.User", "change_user"),
        ("authentication.User", "delete_user"),
        ("authentication.User", "view_roles"),

        ("users.UserWhitelist", "view_userwhitelist"),
        ("users.UserWhitelist", "add_userwhitelist"),
        ("users.UserWhitelist", "change_userwhitelist"),
        ("users.UserWhitelist", "delete_userwhitelist"),
        ("users.UserAccessLog", "view_useraccesslog"),
    ],
    UserRoles.User: [
        
    ],
}

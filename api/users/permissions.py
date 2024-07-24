from common.permission_policy.permissions import PermissionPolicy


class UsersPermissions(PermissionPolicy):
    rules = [
        {
            "action": "get",
            "condition": "permission:authentication.view_user",
        },
        {
            "action": "post",
            "condition": "permission:authentication.add_user",
        },
        {
            "action": ["put", "patch"],
            "condition": "permission:authentication.change_user",
        },
        {
            "action": "delete",
            "condition": "permission:authentication.delete_user",
        },
    ]


class UserRolesPermissions(PermissionPolicy):
    rules = [
        {
            "action": "get",
            "condition": "permission:authentication.view_roles",
        },
    ]


class UsersWhitelistPermissions(PermissionPolicy):
    rules = [
        {
            "action": "get",
            "condition": "permission:users.view_userwhitelist",
        },
        {
            "action": "post",
            "condition": "permission:users.add_userwhitelist",
        },
        {
            "action": ["put", "patch"],
            "condition": "permission:users.change_userwhitelist",
        },
        {
            "action": "delete",
            "condition": "permission:users.delete_userwhitelist",
        },
    ]


class UserAccessPermissions(PermissionPolicy):
    rules = [
        {
            "action": "get",
            "condition": "permission:users.view_useraccesslog",
        },
    ]

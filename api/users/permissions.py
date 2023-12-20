from common.permissions import PolicyPermissions


class UsersPermissions(PolicyPermissions):
    policies = [
        {
            "action": "get",
            "permission": "authentication.view_user",
        },
        {
            "action": "post",
            "permission": "authentication.add_user",
        },
        {
            "action": ["put", "patch"],
            "permission": "authentication.change_user",
        },
        {
            "action": "delete",
            "permission": "authentication.delete_user",
        },
    ]


class UserRolesPermissions(PolicyPermissions):
    policies = [
        {
            "action": "get",
            "permission": "authentication.view_roles",
        },
    ]


class UsersWhitelistPermissions(PolicyPermissions):
    policies = [
        {
            "action": "get",
            "permission": "users.view_userwhitelist",
        },
        {
            "action": "post",
            "permission": "users.add_userwhitelist",
        },
        {
            "action": ["put", "patch"],
            "permission": "users.change_userwhitelist",
        },
        {
            "action": "delete",
            "permission": "users.delete_userwhitelist",
        },
    ]


class UserAccessPermissions(PolicyPermissions):
    policies = [
        {
            "action": "get",
            "permission": "users.view_useraccesslog",
        },
    ]

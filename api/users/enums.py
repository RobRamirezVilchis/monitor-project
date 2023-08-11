from enum import Enum


class UserRoles(Enum):
    admin = "admin"

user_roles = [role.value for role in UserRoles]
from enum import Enum


class UserRoles(Enum):
    admin = "Admin"

user_roles = [role.value for role in UserRoles]
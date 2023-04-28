from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from allauth.account.auth_backends import AuthenticationBackend as AllAuthAuthenticationBackendBase

UserModel = get_user_model()

class AuthenticationBackend(ModelBackend):

    def get_user(self, user_id):
        try:
            user = UserModel._default_manager.get(pk=user_id)
        except UserModel.DoesNotExist:
            return None
        return user if self.user_can_authenticate(user) else None
    

# Since authentication backends are cached, we also override the
# get_user method in other backends
class AllAuthAuthenticationBackend(AllAuthAuthenticationBackendBase):
    
    def get_user(self, user_id):
        try:
            user = UserModel._default_manager.select_related.get(pk=user_id)
        except UserModel.DoesNotExist:
            return None
        return user if self.user_can_authenticate(user) else None
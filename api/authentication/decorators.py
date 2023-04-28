from rest_framework.response import Response
from rest_framework import exceptions

from django.contrib.auth.models import AnonymousUser

def method_permission_classes(classes):
    '''
        Permission classes for each method in addition to the class level permission_classes
    '''
    def decorator(func):
        def decorated_func(self, *args, **kwargs):
            self.permission_classes = classes
            # this call is needed for request permissions
            self.check_permissions(self.request)
            return func(self, *args, **kwargs)
        return decorated_func
    return decorator
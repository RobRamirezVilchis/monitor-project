from django.db import models
from django.contrib.auth.models import AbstractUser

# https://docs.djangoproject.com/en/4.2/topics/auth/customizing/#substituting-a-custom-user-model

#! Prefer the get_user_model() method over importing the User model directly:
# from django.contrib.auth import get_user_model
# UserModel = get_user_model()

#! Prefer using the AUTH_USER_MODEL setting over a direct import of User 
#! for foreign keys or code executed at import time:
# from django.conf import settings
# settings.AUTH_USER_MODEL

class User(AbstractUser):
    pass

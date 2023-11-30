from datetime import timedelta

from config.env import env


# allauth/dj-rest-auth configuration
# https://django-allauth.readthedocs.io/en/latest/configuration.html
# https://dj-rest-auth.readthedocs.io/en/latest/configuration.html

ACCOUNT_ADAPTER = "authentication.adapter.AccountAdapter"
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_EMAIL_VERIFICATION = "mandatory"
ACCOUNT_AUTHENTICATION_METHOD = "email"
ACCOUNT_CHANGE_EMAIL = True

SOCIALACCOUNT_ADAPTER = "authentication.adapter.SocialAccountAdapter"
SOCIALACCOUNT_EMAIL_VERIFICATION = "none"
SOCIALACCOUNT_EMAIL_REQUIRED = True
SOCIALACCOUNT_STORE_TOKENS = True

REST_AUTH = {
    "USER_DETAILS_SERIALIZER": "authentication.serializers.CustomUserDetailsSerializer",
    "REGISTER_SERIALIZER": "authentication.serializers.CustomRegisterSerializer",
    "PASSWORD_RESET_SERIALIZER": "authentication.serializers.CustomPasswordResetSerializer",

    "SESSION_LOGIN": True,
    "USE_JWT": True,

    "JWT_AUTH_COOKIE": "auth",
    "JWT_AUTH_REFRESH_COOKIE": "refresh",
    "JWT_AUTH_SECURE": True,
    "JWT_AUTH_HTTPONLY": True,
    "JWT_AUTH_SAMESITE": "Lax",
    "JWT_AUTH_RETURN_EXPIRATION": True,
    "JWT_AUTH_COOKIE_USE_CSRF": True,
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(seconds=env.int("ACCESS_TOKEN_LIFETIME", default=3600)), # 1 hour
    "REFRESH_TOKEN_LIFETIME": timedelta(seconds=env.int("REFRESH_TOKEN_LIFETIME", default=2592000)), # 1 month
    "UPDATE_LAST_LOGIN": True,
}

# Provider specific settings
SOCIALACCOUNT_PROVIDERS = {
    "google": {
        # For each OAuth based provider, either add a ``SocialApp``
        # (``socialaccount`` app) containing the required client
        # credentials, or list them here:
        "APP": {
            "client_id": env.str("GOOGLE_CLIENT_ID"),
            "secret": env.str("GOOGLE_CLIENT_SECRET"),
            "key": ""
        },
        "SCOPE": [
            "profile",
            "email",
        ],
        "AUTH_PARAMS": {
            "access_type": "offline",
            "prompt": "consent",
        },
    },
}

GOOGLE_CALLBACK_URL = env.str("GOOGLE_CALLBACK_URL")

# params: <key>
FRONTEND_REGISTER_CONFIRM_PATH = env.str("FRONTEND_REGISTER_CONFIRM_PATH")
# params: <uid>, <token>
FRONTEND_PASSWORD_RESET_PATH = env.str("FRONTEND_PASSWORD_RESET_PATH")
# params: <uid>, <token>
FRONTEND_REGISTER_PASSWORD_RESET_PATH = env.str("FRONTEND_REGISTER_PASSWORD_RESET_PATH")

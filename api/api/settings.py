"""
Django settings for api project.

Generated by "django-admin startproject" using Django 4.2.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.2/ref/settings/
"""

import os
from pathlib import Path
from datetime import timedelta

# environment variables
ENV = {
    "SECRET_KEY": os.getenv("SECRET_KEY"),
    # True | False
    "DEBUG": os.getenv("DEBUG", "False"),
    "LOG_LEVEL": os.getenv("LOG_LEVEL", "INFO"),
    "EMAIL_HOST": os.getenv("EMAIL_HOST"),
    "EMAIL_PORT": os.getenv("EMAIL_PORT"),
    "EMAIL_USER": os.getenv("EMAIL_USER"),
    "EMAIL_PASSWORD": os.getenv("EMAIL_PASSWORD"),
    "GOOGLE_CLIENT_ID": os.getenv("GOOGLE_CLIENT_ID"),
    "GOOGLE_CLIENT_SECRET": os.getenv("GOOGLE_CLIENT_SECRET"),
    "GOOGLE_CALLBACK_URL": os.getenv("GOOGLE_CALLBACK_URL"),
    # 0 based index number
    "COMPANY_DOMAIN_INDEX": os.getenv("COMPANY_DOMAIN_INDEX", "0"),
    "FRONTEND_URL": os.getenv("FRONTEND_URL"),
    # params: <key>
    "FRONTEND_REGISTER_CONFIRM_PATH": os.getenv("FRONTEND_REGISTER_CONFIRM_PATH"),
    # params: <uid>, <token>
    "FRONTEND_PASSWORD_RESET_PATH": os.getenv("FRONTEND_PASSWORD_RESET_PATH"),
}

# Build paths inside the project like this: BASE_DIR / "subdir".
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = ENV["SECRET_KEY"]

# SECURITY WARNING: don"t run with debug turned on in production!
DEBUG = ENV["DEBUG"] == "True"

ALLOWED_HOSTS = ["*"]


# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third party apps
    "corsheaders",
    "rest_framework",
    "rest_framework.authtoken",
    "dj_rest_auth",
    "django_filters",
    "allauth",
    "allauth.account",
    "dj_rest_auth.registration",
    "allauth.socialaccount",
    "allauth.socialaccount.providers.google",
    "guardian",
    "drf_standardized_errors",
    # Local apps
    "authentication",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "api.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [
            os.path.join(BASE_DIR, "authentication/templates"), 
        ],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                # Needed by `allauth`:
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "api.wsgi.application"


# User model
AUTH_USER_MODEL = "authentication.User"


# Django Guardian
GUARDIAN_MONKEY_PATCH = False
GUARDIAN_RAISE_403 = True


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

# STATIC_ROOT = os.path.join(BASE_DIR, "static/" if DEBUG else "staticfiles/")
# STATICFILES_DIRS = [
#     os.path.join(BASE_DIR, "static/"),
# ]
STATIC_URL = "static/"


# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]
if DEBUG:
    AUTH_PASSWORD_VALIDATORS = []


REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.TokenAuthentication",
        "dj_rest_auth.jwt_auth.JWTCookieAuthentication"
    ], 
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
    ],
    "EXCEPTION_HANDLER": "drf_standardized_errors.handler.exception_handler",
    # "PAGE_SIZE": 25,
}

DRF_STANDARDIZED_ERRORS = { 
    "EXCEPTION_FORMATTER_CLASS": "common.exception_formatter.ExceptionFormatter",
    "EXCEPTION_HANDLER_CLASS": "common.exception_handler.ExceptionHandler",
}


AUTHENTICATION_BACKENDS = [
    # Needed to login by username in Django admin, regardless of `allauth`:
    "django.contrib.auth.backends.ModelBackend",

    # `allauth` specific authentication methods, such as login by e-mail:
    "allauth.account.auth_backends.AuthenticationBackend",

    # Django Guardian for object level permissions
    "guardian.backends.ObjectPermissionBackend",
]


SITE_ID = 1 # This must be setup in the Django admin and must be the frontend url


# allauth/dj-rest-auth configuration
# https://django-allauth.readthedocs.io/en/latest/configuration.html
# https://dj-rest-auth.readthedocs.io/en/latest/configuration.html

ACCOUNT_ADAPTER = "authentication.adapter.AccountAdapter"
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_EMAIL_VERIFICATION = "optional"

SOCIALACCOUNT_ADAPTER = "authentication.adapter.SocialAccountAdapter"
SOCIALACCOUNT_EMAIL_VERIFICATION = "none"
SOCIALACCOUNT_EMAIL_REQUIRED = True
SOCIALACCOUNT_STORE_TOKENS = True

REST_AUTH = {
    "USER_DETAILS_SERIALIZER": "authentication.serializers.CustomUserDetailsSerializer",
    "REGISTER_SERIALIZER": "authentication.serializers.CustomRegisterSerializer",
    "PASSWORD_RESET_SERIALIZER": "authentication.serializers.CustomPasswordResetSerializer",

    "SESSION_LOGIN": True,
    "USE_JWT": False,

    "JWT_AUTH_COOKIE": "auth",
    "JWT_AUTH_REFRESH_COOKIE": "refresh",
    "JWT_AUTH_SECURE": False,
    "JWT_AUTH_HTTPONLY": True,
    "JWT_AUTH_SAMESITE": "Lax",
    "JWT_AUTH_RETURN_EXPIRATION": True,
    "JWT_AUTH_COOKIE_USE_CSRF": True,
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "UPDATE_LAST_LOGIN": True,
}

# Provider specific settings
SOCIALACCOUNT_PROVIDERS = {
    "google": {
        # For each OAuth based provider, either add a ``SocialApp``
        # (``socialaccount`` app) containing the required client
        # credentials, or list them here:
        "APP": {
            "client_id": ENV["GOOGLE_CLIENT_ID"],
            "secret": ENV["GOOGLE_CLIENT_SECRET"],
            "key": ""
        },
        "SCOPE": [
            "profile",
            "email",
        ],
        "AUTH_PARAMS": {
            "access_type": "offline",
            "prompt": "consent",
        }
    }
}


# CORS
CORS_ALLOWED_ORIGINS = [ENV["FRONTEND_URL"]]
CORS_ORIGIN_WHITELIST = [ENV["FRONTEND_URL"]]
CSRF_TRUSTED_ORIGINS = [ENV["FRONTEND_URL"]]
CORS_ALLOW_CREDENTIALS = True


# CSRF
CSRF_COOKIE_NAME = "csrftoken_django"
CSRF_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_HTTPONLY = False


# Session
SESSION_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_AGE = 43200


if DEBUG:
    CSRF_COOKIE_SECURE = False
    SESSION_COOKIE_SECURE = False
else:
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_DOMAIN = ENV["COOKIE_DOMAIN"]
    CSRF_COOKIE_DOMAIN = ENV["COOKIE_DOMAIN"]


# Email settings

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = ENV["EMAIL_HOST"]
EMAIL_PORT = ENV["EMAIL_PORT"]
EMAIL_HOST_USER = ENV["EMAIL_USER"]
EMAIL_HOST_PASSWORD = ENV["EMAIL_PASSWORD"]
EMAIL_USE_TLS = True


# https://docs.djangoproject.com/en/4.1/topics/logging/
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "color"
        },
        "console.simple": {
            "class": "logging.StreamHandler",
            "formatter": "color"
        }
    },
    "loggers": {
        "django.db.backends": { # Log queries: https://stackoverflow.com/questions/4375784/how-to-log-all-sql-queries-in-django
            "level": ENV["LOG_LEVEL"] or "WARNING",
            "handlers": ["console"],
        },
        "core": {
            "level": ENV["LOG_LEVEL"] or "WARNING",
            "handlers": ["console"],
        }
    },
    "formatters": {
        "verbose": {
            "format": "{name} {levelname} {asctime} {module} {process:d} {thread:d} {message}",
            "datefmt": "%Y-%m-%d %H:%M:%S",
            "style": "{",
        },
        "simple": {
            "format": "{asctime} {levelname}: {message}",
            "datefmt": "%Y-%m-%d %H:%M:%S",
            "style": "{",
        },
        "color": {
            "()": "colorlog.ColoredFormatter",
            "format": "{asctime}{log_color} {levelname}: {message}",
            "datefmt": "%Y-%m-%d %H:%M:%S",
            "log_colors": {
                "DEBUG":    "blue",
                "INFO":     "green",
                "WARNING":  "yellow",
                "ERROR":    "red",
                "CRITICAL": "bold_red",
            },
            "style": "{",
        },
        "color.simple": {
            "()": "colorlog.ColoredFormatter",
            "format": "---{log_color} {levelname}: {message}",
            "log_colors": {
                "DEBUG":    "blue",
                "INFO":     "green",
                "WARNING":  "yellow",
                "ERROR":    "red",
                "CRITICAL": "bold_red",
            },
            "style": "{",
        },
    },
}

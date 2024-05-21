"""
Django settings for api project.

Generated by "django-admin startproject" using Django 4.2.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.2/ref/settings/
"""

import os

from config.env import BASE_DIR, env


env.read_env(os.path.join(BASE_DIR, ".env"))
DATA_UPLOAD_MAX_NUMBER_FIELDS = 10000


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "django-insecure-kl%vzc63d*8lzxko+zd@ti%f&lpek0ghv9_x7^l5qkv$a07v*h"

# SECURITY WARNING: don"t run with debug turned on in production!
DEBUG = env.bool("DEBUG", default=False)

ALLOWED_HOSTS = ["*"]


# Application definition

LOCAL_APPS = [
    "api",
    "authentication",
    "common",
    "core",
    "files",
    "integrations",
    "users",
    "monitor"
]

THIRD_PARTY_APPS = [
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
    "drf_spectacular",
    "django_crontab"
]

CRONJOBS = [
    ('*/10 * * * *', 'monitor.cron.update_driving_status', '>> ' +
     os.path.join(BASE_DIR, 'monitor/log/debug_sd.log' + ' 2>&1 ')),
    ('*/10 * * * *', 'monitor.cron.update_industry_status', '>> ' +
     os.path.join(BASE_DIR, 'monitor/log/debug_ind.log' + ' 2>&1 ')),
    ('*/10 * * * *', 'monitor.cron.update_retail_status', '>> ' +
     os.path.join(BASE_DIR, 'monitor/log/debug_ret.log' + ' 2>&1 ')),
    ('*/10 * * * *', 'monitor.cron.update_servers_status', '>> ' +
     os.path.join(BASE_DIR, 'monitor/log/debug_servers.log' + ' 2>&1 ')),
    ('10 10 * * *', 'monitor.cron.send_daily_sd_report', '>> ' +
     os.path.join(BASE_DIR, 'monitor/log/debug_reports.log' + ' 2>&1 ')),
    ('0 * * * *', 'monitor.cron.register_severity_counts', '>> ' +
     os.path.join(BASE_DIR, 'monitor/log/debug_counts.log' + ' 2>&1 ')),
    ('30 * * * *', 'monitor.cron.check_inactive_units', '>> ' +
     os.path.join(BASE_DIR, 'monitor/log/debug_check_inactive.log' + ' 2>&1 ')),
    ('*/30 * * * *', 'monitor.cron.check_severity_ratios'),
]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    *THIRD_PARTY_APPS,
    *LOCAL_APPS,
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
    "core.middleware.TimezoneMiddleware",
]

ROOT_URLCONF = "config.urls"

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
                # Needed by allauth:
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"


# User model
AUTH_USER_MODEL = "authentication.User"


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

DATABASES = {
    "default": env.db("DEFAULT_DB", engine="django.db.backends.postgresql_psycopg2"),
}


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_ROOT = os.path.join(BASE_DIR, "static/")
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


AUTHENTICATION_BACKENDS = [
    # Needed to login by username in Django admin, regardless of `allauth`:
    "django.contrib.auth.backends.ModelBackend",

    # allauth specific authentication methods, such as login by e-mail:
    "allauth.account.auth_backends.AuthenticationBackend",

    # Django Guardian for object level permissions
    "guardian.backends.ObjectPermissionBackend",
]


APP_DOMAIN = env.str("APP_DOMAIN", default="http://localhost:8000")

SITE_ID = 1


# CSRF
CSRF_COOKIE_NAME = "csrftoken_django"
CSRF_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_SECURE = False


REST_FRAMEWORK = {
    "DEFAULT_VERSIONING_CLASS": "rest_framework.versioning.URLPathVersioning",
    "VERSION_PARAM": "version",
    "DEFAULT_VERSION": "v1",

    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
    ],
    "EXCEPTION_HANDLER": "drf_standardized_errors.handler.exception_handler",
    "EXCEPTION_HANDLER_CLASS": "api.exception_handlers.ExceptionHandler",
    "DEFAULT_PAGINATION_CLASS": "api.pagination.PageNumberPagination",
    # "PAGE_SIZE": 25,
    "DEFAULT_SCHEMA_CLASS": "api.openapi.AutoSchema",
}


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
            "formatter": "color.simple"
        }
    },
    "loggers": {
        "core": {
            "level": env.str("LOG_LEVEL", default="WARNING"),
            "handlers": ["console.simple"],
        },
        # Log queries: https://stackoverflow.com/questions/4375784/how-to-log-all-sql-queries-in-django
        "django.db.backends": {
            "level": env.str("LOG_LEVEL", default="WARNING"),
            "handlers": ["console"],
        },
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
            "format": "[{asctime}]{log_color} {levelname}: {message}",
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
            "format": ">>{log_color} {levelname}: {message}",
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

from config.settings.cors import *  # noqa
from config.settings.email import *  # noqa
from config.settings.errors import *  # noqa
from config.settings.files_and_storages import *  # noqa
from config.settings.guardian import *  # noqa
from config.settings.openapi import *  # noqa
from config.settings.rest_auth import *  # noqa
from config.settings.session import *  # noqa
from config.settings.soft_delete import *  # noqa

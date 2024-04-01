from .base import *  # noqa

from config.env import env


SECRET_KEY = env("SECRET_KEY")
DEBUG = env.bool("DEBUG", default=False)
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=[])

CORS_ALLOW_ALL_ORIGINS = True
CORS_ORIGIN_WHITELIST = env.list("CORS_ORIGIN_WHITELIST", default=[])
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=[])

CSRF_COOKIE_SECURE = True
# CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_DOMAIN = env.str("COOKIE_DOMAIN")
CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS", default=[])

SESSION_COOKIE_SECURE = True
SESSION_COOKIE_DOMAIN = env.str("COOKIE_DOMAIN")

# STATICFILES_DIRS = [
#     os.path.join(BASE_DIR, "static/"),
# ]
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles/")

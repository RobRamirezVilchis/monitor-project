from config.env import env


CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = True

BACKEND_URL = env.str("BACKEND_URL", default="http://localhost:8000")
FRONTEND_URL = env.str("FRONTEND_URL", default="http://localhost:3000")

CORS_ORIGIN_WHITELIST = env.list("CORS_ORIGIN_WHITELIST", default=[FRONTEND_URL])

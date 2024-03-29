from config.env import env


SESSION_COOKIE_SECURE = False
SESSION_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_AGE = env.int("SESSION_COOKIE_AGE", default=604800) # 1 week

SESSION_LIFETIME = env.int("SESSION_LIFETIME", default=604800) # 1 week
SOCIAL_SESSION_LIFETIME = env.int("SOCIAL_SESSION_LIFETIME", default=2592000) # 1 month

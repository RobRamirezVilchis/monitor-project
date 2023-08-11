from django.urls import path, include

from . import apis


user_access_patterns = [
    path("", apis.UserAccessListApi.as_view(), name="list"),
]

user_whitelist_patterns = [
    path("", apis.UsersWhitelistListApi.as_view(), name="list"),
    path("<int:pk>/", apis.UsersWhitelistDetailApi.as_view(), name="detail"),
]

urlpatterns = [
    path("users/access/", include((user_access_patterns, "user_access"))),
    path("users/whitelist/", include((user_whitelist_patterns, "user_whitelist"))),
]
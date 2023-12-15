from django.urls import path, include

from . import apis


urlpatterns = [
    path("", 
        include(([
            path("", apis.UsersListApi.as_view(), name="list"),
            path("<int:pk>/", apis.UsersDetailApi.as_view(), name="detail"),
        ], "users"))
    ),
    path("access/", 
        include(([
            path("", apis.UserAccessListApi.as_view(), name="list"),
        ], "user_access"))
    ),
    path("roles/", apis.UserRolesListApi.as_view(), name="user_roles"),
    path("whitelist/", 
        include(([
            path("", apis.UsersWhitelistListApi.as_view(), name="list"),
            path("<int:pk>/", apis.UsersWhitelistDetailApi.as_view(), name="detail"),
        ], "user_whitelist"))
    ),
]

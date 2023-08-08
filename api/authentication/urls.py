from dj_rest_auth import urls as dj_rest_auth_urls
from dj_rest_auth.registration import urls as dj_rest_auth_registration_urls
from django.urls import path, re_path, include
from django.views.generic import TemplateView
from dj_rest_auth.registration.views import (
    SocialAccountListView, SocialAccountDisconnectView
)

from . import views


urlpatterns = [
    # Revert template urls: ------------------------------------------------
    # needed for the password/reset endpoint
    re_path(r"^password-reset/confirm/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,32})/$",
        TemplateView.as_view(),
        name="password_reset_confirm"),
    # needed to prevent a server error when no auto social signup is allowed
    path("fake-signup", TemplateView.as_view(), name="socialaccount_signup"),
    # needed to prevent server error when connecting a social account
    path("fake-socialaccount-connections", TemplateView.as_view(), name="socialaccount_connections"), 

    # Auth endpoints: ------------------------------------------------
    path("user/", views.UserView.as_view(), name="user"),
    path("", include(dj_rest_auth_urls)),
    path("password/reset-token-valid/", views.PasswordResetKeyValidView.as_view(), name="password_reset_token_valid"),
    path("register/", include(dj_rest_auth_registration_urls)),
    path("register/token-valid/", views.RegistrationKeyValidView.as_view(), name="register_token_valid"),
    
    # Social:
    path("socialaccounts/", SocialAccountListView.as_view(), name="social_account_list"),
    path("socialaccounts/<int:pk>/disconnect/", SocialAccountDisconnectView.as_view(), name="social_account_disconnect"),

    # Providers
    path("social/google/", views.GoogleLoginView.as_view(), name="google"),
    path("social/google/connect/", views.GoogleConnectView.as_view(), name="google_connect"),
]

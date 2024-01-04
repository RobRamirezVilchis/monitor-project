from django_filters import rest_framework as rf_filters

from common import filters

class CharInFilter(rf_filters.BaseInFilter, rf_filters.CharFilter):
    lookup_expr="in"


class UsersFilter(rf_filters.FilterSet):
    search = filters.SearchFilter(
        search_fields=[
            "email",
            # "groups__name",
            "first_name",
            "last_name",
            "full_name",
            "username",
        ],
        distinct=True,
    )
    sort = rf_filters.OrderingFilter(
        fields=(
            ("email", "email"),
            # ("groups__name", "roles"),
            ("id", "id"),
            ("first_name", "first_name"),
            ("last_name", "last_name"),
            ("full_name", "full_name"),
            ("username", "username"),
        ),
    )
    full_name = rf_filters.CharFilter(lookup_expr="icontains")
    email = rf_filters.CharFilter(lookup_expr="icontains")
    roles = CharInFilter(field_name="groups__name", distinct=True)


class UserAccessLogFilter(rf_filters.FilterSet):
    start_date = rf_filters.DateTimeFilter(field_name="created_at", lookup_expr="gte")
    end_date = rf_filters.DateTimeFilter(field_name="created_at", lookup_expr="lte")
    search = filters.SearchFilter(search_fields=["user__email", "user__first_name", "user__last_name", "=created_at"])
    sort = rf_filters.OrderingFilter(
        fields=(
            ("user__id", "user"),
            ("user__first_name", "first_name"),
            ("user__email", "email"),
            ("last_access", "last_access"),
            ("access", "access"),
        )
    )


class UserWhitelistFilter(rf_filters.FilterSet):
    search = filters.SearchFilter(search_fields=["email", "group__name", "user__first_name", "user__last_name"])
    sort = rf_filters.OrderingFilter(
        fields=(
            ("email", "email"),
            ("group__name", "group"),
            ("id", "id"),
            ("user__id", "user"),
            ("user__first_name", "first_name"),
            ("user__last_name", "last_name"),
        )
    )

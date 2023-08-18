from django_filters import rest_framework as rf_filters

from common import filters


class UserAccessLogFilter(rf_filters.FilterSet):
    start_date = rf_filters.DateTimeFilter(field_name="created_at", lookup_expr="gte")
    end_date = rf_filters.DateTimeFilter(field_name="created_at", lookup_expr="lte")
    search = filters.SearchFilter(search_fields=["user__email", "user__first_name", "user__last_name", "=created_at"])
    sort = rf_filters.OrderingFilter(
        fields=(
            ("user__id", "user"),
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

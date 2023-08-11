from django_filters import rest_framework as rf_filters

from common import filters

from .models import UserAccessLog, UserWhitelist


class UserAccessLogFilter(rf_filters.FilterSet):
    start_date = rf_filters.DateFilter(field_name="created_at", lookup_expr="gte")
    end_date = rf_filters.DateFilter(field_name="created_at", lookup_expr="lte")
    search = filters.SearchFilter(search_fields=["user__email", "user__first_name", "user__last_name"])
    sort = rf_filters.OrderingFilter(
        fields=(
            ("created_at", "created_at"),
            ("user__id", "id"),
            ("user__email", "email"),
            ("user__first_name", "first_name"),
            ("user__last_name", "last_name"),
        )
    )

    class Meta:
        model = UserAccessLog
        fields = ["start_date", "end_date"]


class UserWhitelistFilter(rf_filters.FilterSet):
    search = filters.SearchFilter(search_fields=["email", "group__name", "user__first_name", "user__last_name"])
    sort = rf_filters.OrderingFilter(
        fields=(
            ("email", "email"),
            ("group__name", "group"),
            ("user__id", "id"),
            ("user__first_name", "first_name"),
            ("user__last_name", "last_name"),
        )
    )

    class Meta:
        model = UserWhitelist
        fields = ["email", "group", "user"]

from django_filters import rest_framework as filters
from django_filters.constants import EMPTY_VALUES
from django.db.models import Q
from django.db.models.constants import LOOKUP_SEP
from functools import reduce
from operator import or_
from rest_framework.compat import distinct
from rest_framework.settings import api_settings


def filter_queryset(queryset, request, view):
    """
    Filter the queryset based on the request and the view.
    """
    filter_backends = getattr(view, "filter_backends", api_settings.DEFAULT_FILTER_BACKENDS)
    if filter_backends:
        for backend in filter_backends:
            queryset = backend().filter_queryset(request, queryset, view)
    return queryset


class SearchFilter(filters.CharFilter):
    """
    Enable search filter for all fields in the `search_fields` attribute.
    Search fields can be prefixed with '^', '=', '@', or '$' to define
    the lookup expression ('istartswith', 'iexact', 'search', and 'iregex' respectively).
    If no prefix is provided, 'icontains' is used.
    """
    lookup_prefixes = {
        "^": "istartswith",
        "=": "iexact",
        "@": "search",
        "$": "iregex",
    }

    def __init__(self, *args, **kwargs):
        self.search_fields = kwargs.pop("search_fields", [])

        super().__init__(*args, **kwargs)

    def filter(self, qs, value):
        if value in EMPTY_VALUES:
            return qs

        lookup_fields = [
            self.construct_search(str(search_field))
            for search_field in self.search_fields
        ]

        lookup = reduce(or_, [
            Q(**{lookup_field: value})
            for lookup_field in lookup_fields
        ])

        base = qs
        qs = qs.filter(lookup)
        if self.distinct:
            # Filtering against a many-to-many field requires us to
            # call queryset.distinct() in order to avoid duplicate items
            # in the resulting queryset.
            # We try to avoid this if possible, for performance reasons.
            qs = distinct(qs, base)
        return qs
    
    def construct_search(self, field_name):
        lookup = self.lookup_prefixes.get(field_name[0])
        if lookup:
            field_name = field_name[1:]
        else:
            lookup = "icontains"
        return LOOKUP_SEP.join([field_name, lookup])

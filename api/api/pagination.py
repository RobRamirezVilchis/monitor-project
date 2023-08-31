from collections import OrderedDict
from django.core.paginator import EmptyPage
from drf_spectacular.utils import OpenApiParameter
from rest_framework import serializers
from rest_framework.exceptions import NotFound
from rest_framework.pagination import (
    BasePagination, 
    PageNumberPagination as _PageNumberPagination,
    LimitOffsetPagination as _LimitOffsetPagination,
    CursorPagination as _CursorPagination,
)
from rest_framework.response import Response
from rest_framework.settings import api_settings
from typing import Optional

from .utils import inline_serializer


def get_paginated_response(queryset, serializer_class, request, pagination_class: Optional[BasePagination] = None, view = None):
    pagination_class = pagination_class if pagination_class else api_settings.DEFAULT_PAGINATION_CLASS

    if pagination_class is not None:
        paginator = pagination_class()

        page = paginator.paginate_queryset(queryset, request, view=view)

        if page is not None:
            serializer = serializer_class(page, many=True)
            return paginator.get_paginated_response(serializer.data)
    
    serializer = serializer_class(queryset, many=True)

    return Response(serializer.data)
    

class PageNumberPagination(_PageNumberPagination):
    """
    A simple page number based style that supports page numbers as
    query parameters. For example:

    http://api.example.org/accounts/?page=4
    http://api.example.org/accounts/?page=4&page_size=100

    NOTE: Setting a default PAGE_SIZE in settings.py will make
    paginate_queryset to always return a page object (if the page and queryset are valid).
    """
    page_size_query_param = "page_size"

    def get_paginated_response(self, data):
        return Response(OrderedDict([
            ("data", data),
            ("pagination",
                OrderedDict([
                    ("page", self.page.number),
                    ("page_size", self.page.paginator.per_page),
                    ("count", self.page.paginator.count),
                    ("pages", self.page.paginator.num_pages),
                ]),
            )
        ]))
    
    def paginate_queryset(self, queryset, request, view=None):
        """
        Paginate a queryset if required, either returning a
        page object, or `None` if pagination is not configured for this view.
        A valid page is always returned, even if the page argument isn't
        a number (returns first page) or isn't in range (returns last page).
        """
        page_size = self.get_page_size(request)
        if not page_size:
            return None

        paginator = self.django_paginator_class(queryset, page_size)
        page_number = self.get_page_number(request, paginator)

        try:
            self.page = paginator.get_page(page_number)
        except EmptyPage as exc:
            msg = self.invalid_page_message.format(
                page_number=page_number, message=str(exc)
            )
            raise NotFound(msg)

        if paginator.num_pages > 1 and self.template is not None:
            # The browsable API should display pagination controls.
            self.display_page_controls = True

        self.request = request
        return list(self.page)

    def get_paginated_response_schema(self, schema):
        return {
            "type": "object",
            "properties": {
                "pagination": {
                    "type": "object",
                    "properties": {
                        "page": {
                            "type": "integer",
                            "example": 1,
                        },
                        "page_size": {
                            "type": "integer",
                            "example": 25,
                        },
                        "count": {
                            "type": "integer",
                            "example": 100,
                        },
                        "pages": {
                            "type": "integer",
                            "example": 4,
                        },
                    }
                },
                "data": schema,
            },
        }
    
    @classmethod
    def get_paginated_response_serializer(cls, data_serializer):
        return inline_serializer(
            name = "PageNumberPagination_" + data_serializer.__qualname__ + "_PaginatedResponseSerializer",
            fields = {
                "pagination": inline_serializer(
                    name = "PageNumberPagination_" + data_serializer.__qualname__ + "_PaginatedResponse_PaginationSerializer",
                    fields = {
                        "page": serializers.IntegerField(),
                        "page_size": serializers.IntegerField(),
                        "count": serializers.IntegerField(),
                        "pages": serializers.IntegerField(),
                    }
                ),
                "data": data_serializer(many = True),
            }
        )
        

class LimitOffsetPagination(_LimitOffsetPagination):
    
    @classmethod
    def get_paginated_response_serializer(cls, data_serializer):
        return inline_serializer(
            name = "LimitOffsetPagination_" + data_serializer.__qualname__ + "_PaginatedResponseSerializer",
            fields = {
                "count": serializers.IntegerField(),
                "next": serializers.URLField(allow_null = True),
                "previous": serializers.URLField(allow_null = True),
                "results": data_serializer(many = True),
            }
        )


class CursorPagination(_CursorPagination):
    
    @classmethod
    def get_paginated_response_serializer(cls, data_serializer):
        return inline_serializer(
            name = "CursorPagination_" + data_serializer.__qualname__ + "_PaginatedResponseSerializer",
            fields = {
                "next": serializers.CharField(allow_null = True),
                "previous": serializers.CharField(allow_null = True),
                "results": data_serializer(many = True),
            }
        )
    

def get_openapi_pagination_parameters(pagination_class = None, view = None):
    pagination_class = pagination_class if pagination_class else api_settings.DEFAULT_PAGINATION_CLASS
    parameters = []

    if getattr(pagination_class, "page_query_param", None):
        parameters.append(OpenApiParameter(
            name = pagination_class.page_query_param,
            type = int,
            location = OpenApiParameter.QUERY,
            required = False,
            description = getattr(pagination_class, "page_query_description", 
                                  "A page number within the paginated result set."),
        ))
    if getattr(pagination_class, "page_size_query_param", None):
        parameters.append(OpenApiParameter(
            name = pagination_class.page_size_query_param,
            type = int,
            location = OpenApiParameter.QUERY,
            required = False,
            description = getattr(pagination_class, "page_size_query_description", 
                                  "Number of results to return per page."),
        ))
    if getattr(pagination_class, "limit_query_param", None):
        parameters.append(OpenApiParameter(
            name = pagination_class.limit_query_param,
            type = int,
            location = OpenApiParameter.QUERY,
            required = False,
            description = getattr(pagination_class, "limit_query_description", 
                                  "Number of results to return."),
        ))
    if getattr(pagination_class, "offset_query_param", None):
        parameters.append(OpenApiParameter(
            name = pagination_class.offset_query_param,
            type = int,
            required = False,
            location = OpenApiParameter.QUERY,
            description = getattr(pagination_class, "offset_query_description", 
                                  "The initial index from which to return the results."),
        ))
    if getattr(pagination_class, "cursor_query_param", None):
        parameters.append(OpenApiParameter(
            name = pagination_class.cursor_query_param,
            type = str,
            required = False,
            location = OpenApiParameter.QUERY,
            description = getattr(pagination_class, "cursor_query_description", 
                                  "A cursor value, to be used in conjunction with the cursor pagination."),
        ))

    return parameters

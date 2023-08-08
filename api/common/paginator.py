from typing import Optional
from collections import OrderedDict
from rest_framework.pagination import (
    BasePagination, PageNumberPagination as _PageNumberPagination
)
from rest_framework.response import Response
from rest_framework.settings import api_settings

def get_paginated_response(*, queryset, serializer_class, request, view, pagination_class: Optional[BasePagination] = None):
    paginator_class = pagination_class if pagination_class else api_settings.DEFAULT_PAGINATION_CLASS

    if paginator_class is not None:
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
                    ("page_size", self.page_size),
                    ("count", self.page.paginator.count),
                    ("pages", self.page.paginator.num_pages),
                ]),
            )
        ]))

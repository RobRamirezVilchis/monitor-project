from collections import OrderedDict
from django.core.paginator import EmptyPage
from rest_framework.exceptions import NotFound
from rest_framework.pagination import BasePagination, PageNumberPagination as _PageNumberPagination
from rest_framework.response import Response
from rest_framework.settings import api_settings
from typing import Optional


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

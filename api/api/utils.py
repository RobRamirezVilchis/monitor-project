from drf_spectacular.utils import PolymorphicProxySerializer
from rest_framework.settings import api_settings
from uuid import uuid4

from common.utils import create_serializer_class


def inline_serializer(*, fields, name = None, unique = False, data = None, **kwargs):
    # Important note if you are using `drf-spectacular`
    # Please refer to the following issue:
    # https://github.com/HackSoftware/Django-Styleguide/issues/105#issuecomment-1669468898
    # Since you might need to use unique names (uuids) for each inline serializer
    if not name:
        name = uuid4().hex
        unique = False
    if unique:
        name = f"{name}_{uuid4().hex}"
    serializer_class = create_serializer_class(
        name = name, 
        fields=fields
    )

    if data is not None:
        return serializer_class(data=data, **kwargs)

    return serializer_class(**kwargs)


def get_polymorphic_proxy_pagination_serializer(data_serializer_class, pagination_class = None, component_name: str = None, **kwargs):
    """
    A serializer used for OpenApi annotations with drf-spectacular.
    It returns a PolymorphicProxySerializer with a one-of serializer with
    the pagination serializer and the data serializer.
    The pagination_class must implement the get_paginated_response_serializer class method
    that returns a serializer for the paginated response.
    """
    pagination_class = pagination_class if pagination_class else api_settings.DEFAULT_PAGINATION_CLASS

    return PolymorphicProxySerializer(
        component_name = "OneOf_" + pagination_class.__qualname__ + "_" + data_serializer_class.__qualname__,
        serializers = [
            pagination_class.get_paginated_response_serializer(data_serializer_class),
            data_serializer_class(many = True),
        ], 
        resource_type_field_name = None, 
        many = False, 
        **kwargs
    )

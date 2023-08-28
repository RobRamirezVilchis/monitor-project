from rest_framework import serializers
from uuid import uuid4

from common.utils import create_serializer_class


def inline_serializer(*, fields, data=None, **kwargs):
    # Important note if you are using `drf-spectacular`
    # Please refer to the following issue:
    # https://github.com/HackSoftware/Django-Styleguide/issues/105#issuecomment-1669468898
    # Since you might need to use unique names (uuids) for each inline serializer
    serializer_class = create_serializer_class(name=uuid4().hex, fields=fields)

    if data is not None:
        return serializer_class(data=data, **kwargs)

    return serializer_class(**kwargs)

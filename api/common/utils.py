from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.http import Http404
from django.shortcuts import get_object_or_404
from importlib import import_module
from rest_framework import serializers
import sys


def make_mock_object(**kwargs):
    return type("", (object,), kwargs)


def get_object(model_or_queryset, **kwargs):
    """
    Reuse get_object_or_404 since the implementation supports both Model && queryset.
    Catch Http404 & return None
    """
    try:
        return get_object_or_404(model_or_queryset, **kwargs)
    except Http404:
        return None


def create_serializer_class(name, fields):
    return type(name, (serializers.Serializer,), fields)


def inline_serializer(*, fields, name="", data=None, **kwargs):
    serializer_class = create_serializer_class(name=name, fields=fields)

    if data is not None:
        return serializer_class(data=data, **kwargs)

    return serializer_class(**kwargs)


def assert_settings(required_settings, error_message_prefix=""):
    """
    Checks if each item from `required_settings` is present in Django settings
    """
    not_present = []
    values = {}

    for required_setting in required_settings:
        if not hasattr(settings, required_setting):
            not_present.append(required_setting)
            continue

        values[required_setting] = getattr(settings, required_setting)

    if not_present:
        if not error_message_prefix:
            error_message_prefix = "Required settings not found."

        stringified_not_present = ", ".join(not_present)

        raise ImproperlyConfigured(
            f"{error_message_prefix} Could not find: {stringified_not_present}")

    return values


def value_to_enum(enum_cls, value):
    for x in enum_cls:
        if x.value == value:
            return x

    raise ImproperlyConfigured(
        f"Value {repr(value)} could not be found in {repr(enum_cls)}")


def import_from_string(dotted_path):
    try:
        module_path, class_name = dotted_path.rsplit(".", 1)

        if not (
            (module := sys.modules.get(module_path))
            and (spec := getattr(module, "__spec__", None))
            and getattr(spec, "_initializing", False) is False
        ):
            module = import_module(module_path)
        return getattr(module, class_name)

    except ImportError as e:
        raise ImportError(
            f"Could not import '{dotted_path}'. {e.__class__.__name__}: {e}")
    except AttributeError as e:
        raise AttributeError(
            f"Could not import '{dotted_path}'. {e.__class__.__name__}: {e}")

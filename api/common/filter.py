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

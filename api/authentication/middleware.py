from .constants import HOST_HMT, HOST_MET, HOST_MEL, HOST_MLB
import os

ALLOWED_DOMAIN_NAMES = [
    HOST_HMT,
    HOST_MET,
    HOST_MEL,
    HOST_MLB,
]

DOMAIN_IDX = int(os.getenv("COMPANY_DOMAIN_INDEX", 0))

class DomainMiddleware:
    """
        Sets a custom 'domain' property to the response containing
        the domain of the host, without the subdomain
    """
    def __init__(self, get_response):
        self.get_response = get_response
        # One-time configuration and initialization.

    def __call__(self, request):
        # Code to be executed for each request before
        # the view (and later middleware) are called.
        host = request.get_host()

        host_split = host.split('.', DOMAIN_IDX + 1)
        domain = None
        if len(host_split) >= (DOMAIN_IDX + 1) and host_split[DOMAIN_IDX] and host_split[DOMAIN_IDX] in ALLOWED_DOMAIN_NAMES:
            domain = host_split[DOMAIN_IDX]
        request.domain = domain

        response = self.get_response(request)

        # Code to be executed for each request/response after
        # the view is called.

        return response
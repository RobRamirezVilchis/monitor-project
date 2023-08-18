from django.utils import timezone
from urllib.parse import unquote
import pytz

class TimezoneMiddleware:

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        tz_name = request.COOKIES.get("tz", None)
        if tz_name is not None:
            try:
                tz_name = unquote(tz_name)
                tz = pytz.timezone(tz_name)
                timezone.activate(tz)
            except:
                timezone.deactivate()
        else:
            timezone.deactivate()

        return self.get_response(request)

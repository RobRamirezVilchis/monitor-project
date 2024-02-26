from django.urls import path, include

from . import apis


urlpatterns = [
    path("driving-status/", 
        include(([
            path("", apis.UnitStatusList.as_view(), name="list"),
        ], "units"))
    ),
    path("industry-status/", 
        include(([
            path("", apis.DeviceStatusList.as_view(), name="ist"),
        ], "devices"))
    ),
]
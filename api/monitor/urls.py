from django.urls import path, include

from . import apis


urlpatterns = [
    path("driving-status/", 
        include(([
            path("", apis.UnitStatusList.as_view(), name="list"),
        ], "units"))
    ),
    path("driving-status-count/", 
        include(([
            path("", apis.SeverityCount.as_view(), name="list"),
        ], "unit-count"))
    ),
    path("driving-status/history/<int:unit>/", 
        include(([
            path("", apis.UnitHistoryList.as_view(), name="list"),
        ], "unit-history"))
    ),
    path("industry-status/history/<int:device>/", 
        include(([
            path("", apis.DeviceHistoryList.as_view(), name="list"),
        ], "device-history"))
    ),
    path("industry-status/", 
        include(([
            path("", apis.DeviceStatusList.as_view(), name="list"),
        ], "devices"))
    ),
]
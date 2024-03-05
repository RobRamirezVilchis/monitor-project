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
            path("", apis.DeviceStatusList.as_view(), name="list"),
        ], "devices"))
    ),

    path("driving-status-count/", 
        include(([
            path("", apis.UnitSeverityCount.as_view(), name="list"),
        ], "unit-count"))
    ),
    path("industry-status-count/", 
        include(([
            path("", apis.DeviceSeverityCount.as_view(), name="list"),
        ], "device-count"))
    ),

    # One device status
    path("driving-status/<int:unit_id>/", 
        include(([
            path("", apis.UnitStatusAPI.as_view(), name="list"),
        ], "unit-status"))
    ),
    path("industry-status/<int:device_id>/", 
        include(([
            path("", apis.DeviceStatusAPI.as_view(), name="list"),
        ], "device-status"))
    ),

    # Device history
    path("driving-status/history/<int:unit_id>/", 
        include(([
            path("", apis.UnitHistoryList.as_view(), name="list"),
        ], "unit-history"))
    ),
    path("industry-status/history/<int:device_id>/", 
        include(([
            path("", apis.DeviceHistoryList.as_view(), name="list"),
        ], "device-history"))
    ),

    path("driving-status/last-status-change/<int:unit_id>/", 
        include(([
            path("", apis.UnitStatusTime.as_view(), name="list"),
        ], "unit-change"))
    ),
    
]
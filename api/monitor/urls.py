from django.urls import path, include

from . import apis


urlpatterns = [
    path("driving-status/",
         include(([
             path("", apis.UnitStatusList.as_view(), name="list"),
         ], "units"))
         ),
    path("driving-status/last-update",
         include(([
             path("", apis.SafeDrivingLastUpdateAPI.as_view(), name="datetime"),
         ], "last-update"))
         ),
    path("industry-status/",
         include(([
             path("", apis.DeviceStatusList.as_view(), name="list"),
         ], "devices"))
         ),
    path("industry-status/last-update",
         include(([
             path("", apis.IndustryLastUpdateAPI.as_view(), name="datetime"),
         ], "last-update"))
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

    # Time in current status
    path("driving-status/last-status-change/<int:unit_id>/",
         include(([
             path("", apis.UnitStatusTime.as_view(), name="list"),
         ], "unit-change"))
         ),

    path("industry-status/last-status-change/<int:device_id>/",
         include(([
             path("", apis.DeviceStatusTime.as_view(), name="list"),
         ], "device-change"))
         ),

    # Clients
    path("driving/clients/",
         include(([
             path("", apis.SafeDrivingClientList.as_view(), name="list"),
         ], "driving-clients"))
         ),
    path("industry/clients/",
         include(([
             path("", apis.IndustryClientList.as_view(), name="list"),
         ], "industry-clients"))
         ),


    # Camera disconnections
    path("industry/camera_disconnections/<int:device_id>/",
         include(([
             path("", apis.CameraDisconnectionsList.as_view(), name="list"),
         ], "industry-disconnections"))
         ),

    # Last active status
    path("driving-status/last-active-status/<int:unit_id>/",
         include(([
             path("", apis.UnitLastActiveStatus.as_view(), name="status"),
         ], "unit-last-active-status"))
         ),

    # Scatterplot data
    path("driving-status/severity-history/<int:unit_id>/",
         include(([
             path("", apis.UnitScatterPlotAPI.as_view(), name="status"),
         ], "unit-scatterplot"))
         ),
    path("industry-status/",
         include(([
             path("severity-history/<int:device_id>/",
                  apis.DeviceScatterPlotAPI.as_view(), name="status"),
         ], "device-scatterplot"))
         ),

    # Area plot data
    path("driving-status/area-plot-data/",
         include(([
             path("", apis.SafeDrivingAreaPlotAPI.as_view(), name="status"),
         ], "units-area-plot"))
         ),

    # Scatterplot data
    path("industry-status/area-plot-data/",
         include(([
             path("", apis.IndustryAreaPlotAPI.as_view(), name="status"),
         ], "devices-area-plot"))
         ),

    # Get logs
    path("industry/device-logs/<int:device_id>/",
         include(([
             path("", apis.IndustryLogsAPI.as_view(), name="status"),
         ], "devices-logs"))
         ),
]

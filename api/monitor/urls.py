from django.urls import path, include

from . import apis


urlpatterns = [
    path("driving/",
         include(([
             path("status/", apis.UnitStatusList.as_view(), name="status"),
             path("clients/", apis.SafeDrivingClientList.as_view(), name="clients"),
             path("last-update/", apis.SafeDrivingLastUpdateAPI.as_view(),
                 name="last-update"),
             path("status-count/", apis.UnitSeverityCount.as_view(), name="list"),
             path("area-plot-data/", apis.SafeDrivingAreaPlotAPI.as_view(),
                  name="units-area-plot"),

             path("units/<int:unit_id>/",
                  include(([
                      path("", apis.UnitStatusAPI.as_view(), name="unit-status"),
                      path("history/", apis.UnitHistoryList.as_view(),
                           name="history"),
                      path("last-status-change/", apis.UnitStatusTime.as_view(),
                           name="last-active-status"),
                      path("last-active-status/", apis.UnitLastActiveStatus.as_view(),
                           name="last-active-status"),
                      path("severity-history/", apis.UnitScatterPlotAPI.as_view(),
                           name="scatter-plot"),
                  ], "unit")
                  )),

         ], "safe-driving"))
         ),

    path("industry/",
         include(([
             path("status/", apis.DeviceStatusList.as_view(), name="status"),
             path("clients/", apis.IndustryClientList.as_view(), name="clients"),
             path("last-update/", apis.IndustryLastUpdateAPI.as_view(),
                 name="last-update"),
             path("status-count/", apis.DeviceSeverityCount.as_view(), name="list"),
             path("area-plot-data/", apis.IndustryAreaPlotAPI.as_view(),
                  name="units-area-plot"),

             path("devices/<int:device_id>/",
                  include(([
                      path("", apis.DeviceStatusAPI.as_view(),
                           name="unit-status"),
                      path("history/", apis.DeviceHistoryList.as_view(),
                           name="history"),
                      path("last-status-change/", apis.DeviceStatusTime.as_view(),
                           name="last-active-status"),
                      path("severity-history/", apis.DeviceScatterPlotAPI.as_view(),
                           name="scatter-plot"),
                      path("camera-disconnections/", apis.CameraDisconnectionsList.as_view(),
                           name="camera-disconnections"),
                      path("logs/", apis.IndustryLogsAPI.as_view(),
                           name="device-logs"),
                      path("check-wifi-connection/", apis.DeviceWifiProblemsAPI.as_view(),
                           name="device-connection"),
                  ], "device")
                  )),

         ], "industry"))
         ),

]

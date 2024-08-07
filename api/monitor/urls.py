from django.urls import path, include

from . import apis


urlpatterns = [
    path("deployments/", apis.DeploymentList.as_view(), name="deployments"),
    path("gx-models/",
         include(([
             path("<int:gx_id>/",
                  include(([
                      path("", apis.GxModelAPI.as_view(),
                           name="gx_model"),
                  ], "device_data")))
         ], "gx_models")),
         ),
    path("records/",
         include(([
             path("<int:device_id>/",
                  include(([
                      path("", apis.GxRecordsAPI.as_view(),
                           name="records_list"),
                      path("thresholds/", apis.GxMetricThresholdsAPI.as_view(),
                           name="thresholds"),
                      path("modify-thresholds/", apis.ModifyThresholdsAPI.as_view(),
                           name="modify-thresholds"),
                  ], "device data")))
         ], "records")),
         ),
    path("driving/",
         include(([
             path("status/", apis.UnitStatusList.as_view(), name="status"),
             path("clients/", apis.SafeDrivingClientList.as_view(), name="clients"),
             path("clients/create/",
                  apis.SDClientCreateAPI.as_view(), name="client_create"),
             path("last-update/", apis.SafeDrivingLastUpdateAPI.as_view(),
                 name="last-update"),
             path("status-count/", apis.UnitSeverityCount.as_view(), name="list"),
             path("area-plot-data/", apis.SafeDrivingAreaPlotAPI.as_view(),
                  name="units-area-plot"),


             path("units/<int:unit_id>/",
                  include(([
                      path("", apis.UnitStatusAPI.as_view(), name="unit-status"),
                      path("failed-trips/", apis.UnitFailedTripsAPI.as_view(),
                           name="failed-trips"),
                      path("report/", apis.UnitReportAPI.as_view(),
                           name="unit-report"),
                      path("history/", apis.UnitHistoryList.as_view(),
                           name="history"),
                      path("last-status-change/", apis.UnitStatusTime.as_view(),
                           name="last-active-status"),
                      path("last-active-status/", apis.UnitLastActiveStatus.as_view(),
                           name="last-active-status"),
                      path("severity-history/", apis.UnitScatterPlotAPI.as_view(),
                           name="scatter-plot"),
                      path("trips/", apis.UnitTripsAPI.as_view(),
                           name="trips"),
                      path("logs/", apis.SafeDrivingLogsAPI.as_view(),
                           name="device-logs"),
                      path("set-inactive/", apis.SetUnitAsInactiveAPI.as_view(),
                           name="set-inactive"),
                  ], "unit")
                  )),

         ], "safe-driving"))
         ),

    path("industry/",
         include(([
             path("status/", apis.DeviceStatusList.as_view(), name="status"),
             path("clients/", apis.IndustryClientList.as_view(), name="clients"),
             path("clients/create/",
                  apis.IndClientCreateAPI.as_view(), name="client_create"),
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
                      path("set-inactive/", apis.SetDeviceClientAsInactiveAPI.as_view(),
                           name="set-inactive"),
                  ], "device")
                  )),

         ], "industry"))
         ),
    path("retail/",
         include(([
             path("status/", apis.RetailDeviceStatusList.as_view(), name="status"),
             path("status-count/",
                  apis.RetailDeviceSeverityCount.as_view(), name="status-count"),
             path("clients/", apis.SmartRetailClientList.as_view(), name="clients"),
             path("clients/create/",
                  apis.RetailClientCreateAPI.as_view(), name="client-create"),
             path("area-plot-data/", apis.SmartRetailAreaPlotAPI.as_view(),
                  name="devices-area-plot"),

             path("devices/<int:device_id>/",
                  include(([
                      path("", apis.RetailDeviceStatusAPI.as_view(),
                           name="unit-status"),
                      path("history/", apis.RetailDeviceHistoryList.as_view(),
                           name="history"),
                      path("last-status-change/", apis.RetailDeviceStatusTime.as_view(),
                           name="last-active-status"),
                      path("logs/", apis.RetailLogsAPI.as_view(),
                           name="device-logs"),
                      path("severity-history/", apis.RetailDeviceScatterPlotAPI.as_view(),
                           name="scatter-plot"),
                      path("set-inactive/", apis.SetRetailDeviceAsInactiveAPI.as_view(),
                           name="set-inactive"),
                  ], "device")
                  )),
         ], "retail"))
         ),
    path("smart-buildings/",
         include(([
                  path("status/", apis.DeviceStatusList.as_view(), name="status"),
                  path("clients/", apis.SmartBuildingsClientList.as_view(),
                       name="clients"),
                  path("clients/create/",
                       apis.SBClientCreateAPI.as_view(), name="client_create"),
                  path("last-update/", apis.IndustryLastUpdateAPI.as_view(),
                       name="last-update"),
                  path("status-count/",
                       apis.DeviceSeverityCount.as_view(), name="list"),
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
                           path("logs/", apis.SmartBuildingsLogsAPI.as_view(),
                                name="device-logs"),
                           path("check-wifi-connection/", apis.DeviceWifiProblemsAPI.as_view(),
                                name="device-connection"),
                           path("set-inactive/", apis.SetDeviceClientAsInactiveAPI.as_view(),
                                name="set-inactive"),
                       ], "device")
                       )),

                  ], "smart-buildings"))
         ),
    path("romberg/",
         include(([
                  path("status/", apis.RombergDeviceStatusList.as_view(),
                       name="status"),
                  path("clients/", apis.RombergClientList.as_view(),
                       name="clients"),
                  path("clients/create/",
                       apis.RombergClientCreateAPI.as_view(), name="client_create"),
                  path("last-update/", apis.IndustryLastUpdateAPI.as_view(),
                       name="last-update"),
                  path("status-count/",
                       apis.RombergDeviceSeverityCount.as_view(), name="list"),
                  path("area-plot-data/", apis.IndustryAreaPlotAPI.as_view(),
                       name="area-plot"),

                  path("devices/<int:device_id>/",
                       include(([
                           path("", apis.RombergDeviceStatusAPI.as_view(),
                                name="status"),

                           path("history/", apis.RombergDeviceHistoryList.as_view(),
                                name="history"),
                           path("last-status-change/", apis.RombergDeviceStatusTime.as_view(),
                                name="last-status-change"),
                           path("severity-history/", apis.RombergDeviceScatterPlotAPI.as_view(),
                                name="scatter-plot"),
                           # path("camera-disconnections/", apis.CameraDisconnectionsList.as_view(),
                           #     name="camera-disconnections"),
                           path("logs/", apis.RombergLogsAPI.as_view(),
                               name="device-logs"),
                           # path("check-wifi-connection/", apis.DeviceWifiProblemsAPI.as_view(),
                           #     name="device-connection"),
                           path("set-inactive/", apis.SetRombergDeviceAsInactiveAPI.as_view(),
                                name="set-inactive"),
                       ], "device")
                       )),

                  ], "romberg"))
         ),
    path("servers/",
         include(([
             path("list/", apis.ServerList.as_view(), name="list"),
             path("project/<int:project_id>/",
                  apis.ProjectDataAPI.as_view(), name="project_data"),
             path("project/<int:project_id>/edit/", apis.EditProjectAPI.as_view(),
                  name="edit-project"),
             path("project/<int:project_id>/delete/", apis.DeleteProjectAPI.as_view(),
                  name="delete-project"),
             path("projects/", apis.ProjectsAPI.as_view(), name="projects"),
             path("server-projects/",
                  apis.AllServersProjectsAPI.as_view(), name="projects"),
             path("new-project/", apis.CreateProjectAPI.as_view(),
                  name="create-project"),

             path("status/", apis.ServerStatusListAPI.as_view(), name="status"),
             path("metric-keys/", apis.ServerMetricsAPI.as_view(), name="metrics"),

             path("regions/", apis.ServerRegionsAPI.as_view(), name="regions"),
             path("types/", apis.ServerTypesAPI.as_view(), name="types"),
             path("thresholds/", apis.ServerMetricThresholdsAPI.as_view(),
                  name="thresholds"),
             path("modify-thresholds/", apis.ModifyServerThresholdsAPI.as_view(),
                  name="thresholds"),
             path("server/<int:server_id>/",
                 include(([

                     path("", apis.ServerStatusAPI.as_view(),
                          name="server-status"),
                     path("history/", apis.ServerHistoryList.as_view(),
                          name="server-history"),
                     path("severity-history/", apis.ServerScatterPlotAPI.as_view(),
                          name="server-scatterplot"),
                     path("projects/", apis.ServerProjectsList.as_view(),
                          name="projects"),
                     path("modify-projects/", apis.ModifyServerProjectsAPI.as_view(),
                         name="modify-projects"),

                 ], "server")
                 )),
         ], "servers"))),
    path("rds/",
         include(([
             path("list/", apis.RDSList.as_view(), name="list"),
             path("status/", apis.RDSStatusListAPI.as_view(), name="status"),
             path("rds-projects/", apis.AllRDSProjectsAPI.as_view(),
                  name="rds_projects"),
             path("metric-keys/", apis.RDSMetricsAPI.as_view(), name="metrics"),
             path("regions/", apis.ServerRegionsAPI.as_view(), name="regions"),
             path("types/", apis.RDSTypesAPI.as_view(), name="types"),
             path("thresholds/", apis.RDSMetricThresholdsAPI.as_view(),
                  name="thresholds"),
             path("modify-thresholds/", apis.ModifyRDSThresholdsAPI.as_view(),
                  name="thresholds"),
             path("db/<int:rds_id>/",
                  include(([
                      path("", apis.RDSStatusAPI.as_view(),
                          name="rds-status"),
                      path("history/", apis.RDSHistoryList.as_view(),
                          name="history"),
                      path("severity-history/", apis.RDSScatterPlotAPI.as_view(),
                          name="scatterplot"),
                      path("projects/", apis.RDSProjectsList.as_view(),
                          name="projects"),
                  ], "rds")
                  )),
         ], "rds"))),
    path("load-balancers/",
         include(([
                  path("list/", apis.LoadBalancerList.as_view(), name="list"),
                  path("status/", apis.LoadBalancerStatusListAPI.as_view(),
                       name="status"),
                  path("metric-keys/", apis.LoadBalancerMetricsAPI.as_view(),
                       name="metrics"),
                  path("regions/", apis.ServerRegionsAPI.as_view(), name="regions"),
                  path("thresholds/", apis.LoadBalancerMetricThresholdsAPI.as_view(),
                       name="thresholds"),
                  path("modify-thresholds/", apis.ModifyLoadBalancerThresholdsAPI.as_view(),
                       name="thresholds"),
                  path("elb/<int:elb_id>/",
                       include(([
                           path("", apis.LoadBalancerStatusAPI.as_view(),
                                name="status"),
                           path("severity-history/", apis.LoadBalancerScatterPlotAPI.as_view(),
                                name="scatterplot"),
                           path("history/", apis.LoadBalancerHistoryList.as_view(),
                                name="history"),

                       ], "elb")
                       )),
                  ], "load_balancers")))

]

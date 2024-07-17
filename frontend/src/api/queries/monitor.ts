import defaultQueryClient from "../clients/defaultQueryClient";
import { createQuery } from "../helpers/createQuery";
import * as monitorService from "../services/monitor";
import { AreaPlotFilters, DeviceFilters, DeviceLogsFilters, DeviceSeverityHistoryFilters, LoadBalancerFilters, LoadBalancerHistoryFilters, LoadBalancerStatusFilters, RDSFilters, RDSHistoryFilters, RDSStatusFilters, RetailDeviceSeverityHistoryFilters, ServerFilters, ServerHistoryFilters, ServerStatusFilters, UnitFilters, UnitLogsFilters, UnitSeverityHistoryFilters } from "../services/monitor/types";


export const useDeploymentsQuery = createQuery({
  queryPrimaryKey: "deployments",
  //queryKeyVariables: (vars: UsersFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getDeployments({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});


// Safe Driving API ----------------------------------------------------------

export const useUnitsQuery = createQuery({
  queryPrimaryKey: "units",
  //queryKeyVariables: (vars: UsersFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getUnits({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
  refetchInterval: 60000,
  refetchIntervalInBackground: true
});

export const useUnitStatusQuery = createQuery({
  queryPrimaryKey: "unit_status",
  queryKeyVariables: (vars: UnitFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getUnitStatus(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
  refetchInterval: 60000,
  refetchIntervalInBackground: true
});

export const useUnitReportQuery = createQuery({
  queryPrimaryKey: "unit-report",
  queryKeyVariables: (vars: UnitFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getUnitReportContent(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
  refetchInterval: 60000,
  refetchIntervalInBackground: true
});

export const useUnitHistoryQuery = createQuery({
  queryPrimaryKey: "unit_history",
  queryKeyVariables: (vars: UnitFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getUnitHistory(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useDrivingSeverityCount = createQuery({
  queryPrimaryKey: "driving_severity_count",
  //queryKeyVariables: (vars: UsersFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getDrivingSeverityCount({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
  refetchInterval: 60000,
  refetchIntervalInBackground: true
});

export const useDrivingLastUpdateQuery = createQuery({
  queryPrimaryKey: "driving_last_update",
  //queryKeyVariables: (vars: UsersFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getDrivingLastUpdate({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
  refetchInterval: 60000,
  refetchIntervalInBackground: true
});

export const useSafeDrivingAreaPlotData = createQuery({
  queryPrimaryKey: "driving_area_plot_data",
  queryKeyVariables: (vars: AreaPlotFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getSafeDrivingAreaPlotData(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
  refetchInterval: 60000,
  refetchIntervalInBackground: true
});

export const useUnitLastStatusChange = createQuery({
  queryPrimaryKey: "last_status_change",
  queryKeyVariables: (vars: UnitFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getUnitLastStatusChange(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});


export const useUnitFailedTripsQuery = createQuery({
  queryPrimaryKey: "failed-trips",
  queryKeyVariables: (vars: UnitFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getUnitFailedTrips(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});


export const useSafeDrivingClientsQuery = createQuery({
  queryPrimaryKey: "safe_driving_clients",
  //queryKeyVariables: (vars: UsersFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getSafeDrivingClients({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
  refetchInterval: 60000,
  refetchIntervalInBackground: true
});

export const useUnitLastActiveStatus = createQuery({
  queryPrimaryKey: "last_active_status",
  queryKeyVariables: (vars: UnitFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getUnitLastActiveStatus(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

// Scatterplot
export const useUnitSeverityHistory = createQuery({
  queryPrimaryKey: "severity_history",
  queryKeyVariables: (vars: UnitSeverityHistoryFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getUnitSeverityHistory(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useUnitTripsQuery = createQuery({
  queryPrimaryKey: "unit-trips",
  queryKeyVariables: (vars: UnitSeverityHistoryFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getUnitTrips(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useUnitLogsQuery = createQuery({
  queryPrimaryKey: "unit_logs",
  queryKeyVariables: (vars: UnitLogsFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getUnitLogs(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

// Industry API ----------------------------------------------------------

export const useDevicesQuery = createQuery({
  queryPrimaryKey: "devices",
  //queryKeyVariables: (vars: UsersFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getDevices({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: false,
  queryClient: defaultQueryClient,
  refetchInterval: 60000,
  refetchIntervalInBackground: true
});

export const useDeviceStatusQuery = createQuery({
  queryPrimaryKey: "device_status",
  queryKeyVariables: (vars: DeviceFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getDeviceStatus(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
  refetchInterval: 60000,
  refetchIntervalInBackground: true
});

export const useDeviceHistoryQuery = createQuery({
  queryPrimaryKey: "device_history",
  queryKeyVariables: (vars: DeviceFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getDeviceHistory(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useIndustrySeverityCount = createQuery({
  queryPrimaryKey: "industry_severity_count",
  //queryKeyVariables: (vars: UsersFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getIndustrySeverityCount({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
  refetchInterval: 60000,
  refetchIntervalInBackground: true
});

export const useIndustryLastUpdateQuery = createQuery({
  queryPrimaryKey: "industry_last_update",
  //queryKeyVariables: (vars: UsersFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getIndustryLastUpdate({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
  refetchInterval: 60000,
  refetchIntervalInBackground: true
});

export const useIndustryAreaPlotData = createQuery({
  queryPrimaryKey: "industry_area_plot_data",
  queryKeyVariables: (vars: AreaPlotFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getIndustryAreaPlotData(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
  refetchInterval: 60000,
  refetchIntervalInBackground: true
});

export const useIndustryClientsQuery = createQuery({
  queryPrimaryKey: "industry_clients",
  //queryKeyVariables: (vars: UsersFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getIndustryClients({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
  refetchInterval: 60000,
  refetchIntervalInBackground: true
});

export const useCameraDisconnectionsQuery = createQuery({
  queryPrimaryKey: "camera_disconnections",
  queryKeyVariables: (vars: DeviceFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getIndustryCameraDisconnections(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useDeviceLastStatusChange = createQuery({
  queryPrimaryKey: "last_status_change",
  queryKeyVariables: (vars: DeviceFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getDeviceLastStatusChange(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useCheckDeviceWifiQuery = createQuery({
  queryPrimaryKey: "check_wifi",
  queryKeyVariables: (vars: DeviceFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getDeviceWifiStatus(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});


// Scatterplot
export const useDeviceSeverityHistory = createQuery({
  queryPrimaryKey: "severity_history",
  queryKeyVariables: (vars: DeviceSeverityHistoryFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getDeviceSeverityHistory(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useDeviceLogsQuery = createQuery({
  queryPrimaryKey: "device_logs",
  queryKeyVariables: (vars: DeviceLogsFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getDeviceLogs(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

// RDS
export const useAllRDSQuery = createQuery({
  queryPrimaryKey: "all-rds-query",
  queryFn: (ctx) => monitorService.getAllRDS({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});


export const useAllRDSStatusQuery = createQuery({
  queryPrimaryKey: "all-rds-status",
  queryKeyVariables: (vars: RDSStatusFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getAllRDSStatus(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
  refetchInterval: 60000,
  refetchIntervalInBackground: true
});

export const useAllRDSProjectsQuery = createQuery({
  queryPrimaryKey: "all-rds-projects",
  queryFn: (ctx) => monitorService.getAllRDSProjects({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useRDSStatusQuery = createQuery({
  queryPrimaryKey: "rds-status",
  queryKeyVariables: (vars: RDSFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getRDSStatus(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
  refetchInterval: 60000,
  refetchIntervalInBackground: true
});


export const useRDSHistoryQuery = createQuery({
  queryPrimaryKey: "rds-history",
  queryKeyVariables: (vars: RDSHistoryFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getRDSHistory(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useRDSPlotQuery = createQuery({
  queryPrimaryKey: "rds_metric_plot",
  queryKeyVariables: (vars: RDSHistoryFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getRDSMetricPlotData(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useRDSMetricsKeysQuery = createQuery({
  queryPrimaryKey: "rds_metrics_keys",
  queryFn: (ctx) => monitorService.getRDSMetricsKeys({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useRDSRegionsQuery = createQuery({
  queryPrimaryKey: "rds_regions",
  queryFn: (ctx) => monitorService.getRDSRegions({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useRDSTypesQuery = createQuery({
  queryPrimaryKey: "rds_types",
  queryFn: (ctx) => monitorService.getRDSTypes({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

// Load Balancer
export const useAllLoadBalancersQuery = createQuery({
  queryPrimaryKey: "all-elb-query",
  queryFn: (ctx) => monitorService.getAllLoadBalancers({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});


export const useAllLoadBalancerStatusQuery = createQuery({
  queryPrimaryKey: "all-elb-status",
  queryKeyVariables: (vars: LoadBalancerStatusFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getAllLoadBalancerStatus(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
  refetchInterval: 60000,
  refetchIntervalInBackground: true
});

export const useLoadBalancerStatusQuery = createQuery({
  queryPrimaryKey: "elb-status",
  queryKeyVariables: (vars: LoadBalancerFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getLoadBalancerStatus(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
  refetchInterval: 60000,
  refetchIntervalInBackground: true
});


export const useLoadBalancerHistoryQuery = createQuery({
  queryPrimaryKey: "elb-history",
  queryKeyVariables: (vars: LoadBalancerHistoryFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getLoadBalancerHistory(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useLoadBalancerPlotQuery = createQuery({
  queryPrimaryKey: "elb-metric-plot",
  queryKeyVariables: (vars: LoadBalancerHistoryFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getLoadBalancerMetricPlotData(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useLoadBalancerMetricsKeysQuery = createQuery({
  queryPrimaryKey: "elb-metrics-keys",
  queryFn: (ctx) => monitorService.getLoadBalancerMetricsKeys({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useLoadBalancerRegionsQuery = createQuery({
  queryPrimaryKey: "elb-regions",
  queryFn: (ctx) => monitorService.getLoadBalancerRegions({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});


// Servers
export const useAllServersQuery = createQuery({
  queryPrimaryKey: "all-servers-query",
  queryFn: (ctx) => monitorService.getAllServers({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useProjectsQuery = createQuery({
  queryPrimaryKey: "projects",
  queryFn: (ctx) => monitorService.getProjects({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});


export const useProjectDataQuery = createQuery({
  queryPrimaryKey: "project-data",
  queryKeyVariables: (vars: {id: number}) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getProjectData(vars.id, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  enabled: false,
  queryClient: defaultQueryClient,
});



export const useServersProjectsQuery = createQuery({
  queryPrimaryKey: "servers-projects",
  queryFn: (ctx) => monitorService.getServersProjects({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});


export const useServersStatusQuery = createQuery({
  queryPrimaryKey: "servers_status",
  queryKeyVariables: (vars: ServerStatusFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getServersStatus(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
  refetchInterval: 60000,
  refetchIntervalInBackground: true
});

export const useServerStatusQuery = createQuery({
  queryPrimaryKey: "server_status",
  queryKeyVariables: (vars: ServerHistoryFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getServerStatus(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});


export const useServerProjectsQuery = createQuery({
  queryPrimaryKey: "server-projects",
  queryKeyVariables: (vars: ServerFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getServerProjects(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});


export const useServerHistoryQuery = createQuery({
  queryPrimaryKey: "server_history",
  queryKeyVariables: (vars: ServerHistoryFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getServerHistory(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useServerPlotQuery = createQuery({
  queryPrimaryKey: "server_metric_plot",
  queryKeyVariables: (vars: ServerHistoryFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getServerMetricPlotData(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useMetricsKeysQuery = createQuery({
  queryPrimaryKey: "server_metrics_keys",
  queryFn: (ctx) => monitorService.getMetricsKeys({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useServerRegionsQuery = createQuery({
  queryPrimaryKey: "server_regions",
  queryFn: (ctx) => monitorService.getServerRegions({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useServerTypesQuery = createQuery({
  queryPrimaryKey: "server_types",
  queryFn: (ctx) => monitorService.getServerTypes({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

// Smart Retail API ----------------------------------------
export const useRetailStatusQuery = createQuery({
  queryPrimaryKey: "retail-devices",
  queryFn: (ctx, vars) => monitorService.getRetailStatus({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
  refetchInterval: 60000,
  refetchIntervalInBackground: true
});


export const useRetailDeviceStatusQuery = createQuery({
  queryPrimaryKey: "retail-device",
  queryKeyVariables: (vars: DeviceFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getRetailDeviceStatus(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
  refetchInterval: 60000,
  refetchIntervalInBackground: true
});

export const useRetailSeverityCount = createQuery({
  queryPrimaryKey: "retail_severity_count",
  queryFn: (ctx, vars) => monitorService.getSmartRetailSeverityCount({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
  refetchInterval: 60000,
  refetchIntervalInBackground: true
});


export const useRetailDeviceLastStatusChange = createQuery({
  queryPrimaryKey: "retail-last-status-change",
  queryKeyVariables: (vars: DeviceFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getRetailDeviceLastStatusChange(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useRetailDeviceLogsQuery = createQuery({
  queryPrimaryKey: "retail-logs",
  queryKeyVariables: (vars: DeviceLogsFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getRetailDeviceLogs(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});


export const useRetailDeviceHistoryQuery = createQuery({
  queryPrimaryKey: "retail-device-history",
  queryKeyVariables: (vars: DeviceFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getRetailDeviceHistory(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useRetailDeviceSeverityHistory = createQuery({
  queryPrimaryKey: "severity-history",
  queryKeyVariables: (vars: RetailDeviceSeverityHistoryFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getRetailDeviceSeverityHistory(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useSmartRetailAreaPlotData = createQuery({
  queryPrimaryKey: "retail-area-plot-data",
  queryKeyVariables: (vars: AreaPlotFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getSmartRetailAreaPlotData(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
  refetchInterval: 60000,
  refetchIntervalInBackground: true
});


export const useSmartRetailClientsQuery = createQuery({
  queryPrimaryKey: "smart-retail-clients",
  //queryKeyVariables: (vars: UsersFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getSmartRetailClients({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
  refetchInterval: 60000,
  refetchIntervalInBackground: true
});


// Industry API ----------------------------------------------------------

export const useSBDevicesQuery = createQuery({
  queryPrimaryKey: "sb-devices",
  //queryKeyVariables: (vars: UsersFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getSBDevices({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: false,
  queryClient: defaultQueryClient,
  refetchInterval: 60000,
  refetchIntervalInBackground: true
});

export const useSBDeviceStatusQuery = createQuery({
  queryPrimaryKey: "sb-device-status",
  queryKeyVariables: (vars: DeviceFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getSBDeviceStatus(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
  refetchInterval: 60000,
  refetchIntervalInBackground: true
});

export const useSBDeviceHistoryQuery = createQuery({
  queryPrimaryKey: "sb-device-history",
  queryKeyVariables: (vars: DeviceFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getSBDeviceHistory(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useSmartBuildingsSeverityCount = createQuery({
  queryPrimaryKey: "smart-buildings-severity-count",
  //queryKeyVariables: (vars: UsersFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getSmartBuildingsSeverityCount({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
  refetchInterval: 60000,
  refetchIntervalInBackground: true
});

export const useSmartBuildingsLastUpdateQuery = createQuery({
  queryPrimaryKey: "smart-buildings-last-update",
  //queryKeyVariables: (vars: UsersFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getSmartBuildingsLastUpdate({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
  refetchInterval: 60000,
  refetchIntervalInBackground: true
});

export const useSmartBuildingsAreaPlotData = createQuery({
  queryPrimaryKey: "smart-buildings-area-plot",
  queryKeyVariables: (vars: AreaPlotFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getSmartBuildingsAreaPlotData(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
  refetchInterval: 60000,
  refetchIntervalInBackground: true
});

export const useSmartBuildingsClientsQuery = createQuery({
  queryPrimaryKey: "smart-buildings-clients",
  //queryKeyVariables: (vars: UsersFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getSmartBuildingsClients({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
  refetchInterval: 60000,
  refetchIntervalInBackground: true
});

export const useSBCameraDisconnectionsQuery = createQuery({
  queryPrimaryKey: "camera-disconnections",
  queryKeyVariables: (vars: DeviceFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getSmartBuildingsCameraDisconnections(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useSBDeviceLastStatusChange = createQuery({
  queryPrimaryKey: "last-status-change",
  queryKeyVariables: (vars: DeviceFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getSBDeviceLastStatusChange(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useCheckSBDeviceWifiQuery = createQuery({
  queryPrimaryKey: "sb-check-wifi",
  queryKeyVariables: (vars: DeviceFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getSBDeviceWifiStatus(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});


// Scatterplot
export const useSBDeviceSeverityHistory = createQuery({
  queryPrimaryKey: "severity-history",
  queryKeyVariables: (vars: DeviceSeverityHistoryFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getSBDeviceSeverityHistory(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useSBDeviceLogsQuery = createQuery({
  queryPrimaryKey: "device-logs",
  queryKeyVariables: (vars: DeviceLogsFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => monitorService.getSBDeviceLogs(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});
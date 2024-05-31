import { createQuery } from "../helpers/createQuery";
import { getUnits, getDevices, getUnitHistory, getDrivingSeverityCount, getUnitLastStatusChange, getDeviceHistory, getIndustrySeverityCount, getUnitStatus, getDeviceStatus, getSafeDrivingClients, getIndustryClients, getDeviceLastStatusChange, getIndustryCameraDisconnections, getUnitLastActiveStatus, getUnitSeverityHistory, getSafeDrivingAreaPlotData, getIndustryAreaPlotData, getDrivingLastUpdate, getIndustryLastUpdate, getDeviceSeverityHistory, getDeviceLogs, getDeviceWifiStatus, getUnitLogs, getServersStatus, getServerStatus, getServerHistory, getMetricsKeys, getServerMetricPlotData, getServerRegions, getServerTypes, getRetailDeviceStatus, getSmartRetailSeverityCount, getRetailStatus, getRetailDeviceLastStatusChange, getRetailDeviceLogs, getRetailDeviceHistory, getRetailDeviceSeverityHistory, getSmartRetailAreaPlotData, getSmartRetailClients, getUnitReportContent, getRDSStatus, getAllRDSStatus, getRDSHistory, getRDSMetricPlotData, getRDSMetricsKeys, getRDSRegions, getRDSTypes, getAllRDS, getAllServers, getDeployments, getServersProjects, getProjects, getAllLoadBalancers, getAllLoadBalancerStatus, getLoadBalancerStatus, getLoadBalancerHistory, getLoadBalancerMetricPlotData, getLoadBalancerMetricsKeys, getLoadBalancerRegions, getServerProjects } from "../services/monitor";
import { AreaPlotFilters, DeviceFilters, UnitSeverityHistoryFilters, UnitFilters, DeviceSeverityHistoryFilters, DeviceLogsFilters, UnitLogsFilters, ServerHistoryFilters, ServerStatusFilters, RetailDeviceSeverityHistoryFilters, RDSStatusFilters, RDSFilters, RDSHistoryFilters, LoadBalancerFilters, LoadBalancerStatusFilters, LoadBalancerHistoryFilters, ServerFilters } from "../services/monitor/types";
import defaultQueryClient from "../clients/defaultQueryClient";


export const useDeploymentsQuery = createQuery({
  queryPrimaryKey: "deployments",
  //queryKeyVariables: (vars: UsersFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => getDeployments({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});


// Safe Driving API ----------------------------------------------------------

export const useUnitsQuery = createQuery({
  queryPrimaryKey: "units",
  //queryKeyVariables: (vars: UsersFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => getUnits({ signal: ctx.signal }),
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
  queryFn: (ctx, vars) => getUnitStatus(vars, { signal: ctx.signal }),
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
  queryFn: (ctx, vars) => getUnitReportContent(vars, { signal: ctx.signal }),
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
  queryFn: (ctx, vars) => getUnitHistory(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useDrivingSeverityCount = createQuery({
  queryPrimaryKey: "driving_severity_count",
  //queryKeyVariables: (vars: UsersFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => getDrivingSeverityCount({ signal: ctx.signal }),
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
  queryFn: (ctx, vars) => getDrivingLastUpdate({ signal: ctx.signal }),
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
  queryFn: (ctx, vars) => getSafeDrivingAreaPlotData(vars, { signal: ctx.signal }),
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
  queryFn: (ctx, vars) => getUnitLastStatusChange(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});


export const useSafeDrivingClientsQuery = createQuery({
  queryPrimaryKey: "safe_driving_clients",
  //queryKeyVariables: (vars: UsersFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => getSafeDrivingClients({ signal: ctx.signal }),
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
  queryFn: (ctx, vars) => getUnitLastActiveStatus(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

// Scatterplot
export const useUnitSeverityHistory = createQuery({
  queryPrimaryKey: "severity_history",
  queryKeyVariables: (vars: UnitSeverityHistoryFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => getUnitSeverityHistory(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useUnitLogsQuery = createQuery({
  queryPrimaryKey: "unit_logs",
  queryKeyVariables: (vars: UnitLogsFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => getUnitLogs(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

// Industry API ----------------------------------------------------------

export const useDevicesQuery = createQuery({
  queryPrimaryKey: "devices",
  //queryKeyVariables: (vars: UsersFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => getDevices({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
  refetchInterval: 60000,
  refetchIntervalInBackground: true
});

export const useDeviceStatusQuery = createQuery({
  queryPrimaryKey: "device_status",
  queryKeyVariables: (vars: DeviceFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => getDeviceStatus(vars, { signal: ctx.signal }),
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
  queryFn: (ctx, vars) => getDeviceHistory(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useIndustrySeverityCount = createQuery({
  queryPrimaryKey: "industry_severity_count",
  //queryKeyVariables: (vars: UsersFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => getIndustrySeverityCount({ signal: ctx.signal }),
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
  queryFn: (ctx, vars) => getIndustryLastUpdate({ signal: ctx.signal }),
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
  queryFn: (ctx, vars) => getIndustryAreaPlotData(vars, { signal: ctx.signal }),
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
  queryFn: (ctx, vars) => getIndustryClients({ signal: ctx.signal }),
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
  queryFn: (ctx, vars) => getIndustryCameraDisconnections(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useDeviceLastStatusChange = createQuery({
  queryPrimaryKey: "last_status_change",
  queryKeyVariables: (vars: DeviceFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => getDeviceLastStatusChange(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useCheckDeviceWifiQuery = createQuery({
  queryPrimaryKey: "check_wifi",
  queryKeyVariables: (vars: DeviceFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => getDeviceWifiStatus(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});


// Scatterplot
export const useDeviceSeverityHistory = createQuery({
  queryPrimaryKey: "severity_history",
  queryKeyVariables: (vars: DeviceSeverityHistoryFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => getDeviceSeverityHistory(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useDeviceLogsQuery = createQuery({
  queryPrimaryKey: "device_logs",
  queryKeyVariables: (vars: DeviceLogsFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => getDeviceLogs(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

// RDS
export const useAllRDSQuery = createQuery({
  queryPrimaryKey: "all-rds-query",
  queryFn: (ctx) => getAllRDS({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});


export const useAllRDSStatusQuery = createQuery({
  queryPrimaryKey: "all-rds-status",
  queryKeyVariables: (vars: RDSStatusFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => getAllRDSStatus(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
  refetchInterval: 60000,
  refetchIntervalInBackground: true
});

export const useRDSStatusQuery = createQuery({
  queryPrimaryKey: "rds-status",
  queryKeyVariables: (vars: RDSFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => getRDSStatus(vars, { signal: ctx.signal }),
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
  queryFn: (ctx, vars) => getRDSHistory(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useRDSPlotQuery = createQuery({
  queryPrimaryKey: "rds_metric_plot",
  queryKeyVariables: (vars: RDSHistoryFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => getRDSMetricPlotData(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useRDSMetricsKeysQuery = createQuery({
  queryPrimaryKey: "rds_metrics_keys",
  queryFn: (ctx) => getRDSMetricsKeys({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useRDSRegionsQuery = createQuery({
  queryPrimaryKey: "rds_regions",
  queryFn: (ctx) => getRDSRegions({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useRDSTypesQuery = createQuery({
  queryPrimaryKey: "rds_types",
  queryFn: (ctx) => getRDSTypes({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

// Load Balancer
export const useAllLoadBalancersQuery = createQuery({
  queryPrimaryKey: "all-elb-query",
  queryFn: (ctx) => getAllLoadBalancers({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});


export const useAllLoadBalancerStatusQuery = createQuery({
  queryPrimaryKey: "all-elb-status",
  queryKeyVariables: (vars: LoadBalancerStatusFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => getAllLoadBalancerStatus(vars, { signal: ctx.signal }),
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
  queryFn: (ctx, vars) => getLoadBalancerStatus(vars, { signal: ctx.signal }),
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
  queryFn: (ctx, vars) => getLoadBalancerHistory(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useLoadBalancerPlotQuery = createQuery({
  queryPrimaryKey: "elb-metric-plot",
  queryKeyVariables: (vars: LoadBalancerHistoryFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => getLoadBalancerMetricPlotData(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useLoadBalancerMetricsKeysQuery = createQuery({
  queryPrimaryKey: "elb-metrics-keys",
  queryFn: (ctx) => getLoadBalancerMetricsKeys({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useLoadBalancerRegionsQuery = createQuery({
  queryPrimaryKey: "elb-regions",
  queryFn: (ctx) => getLoadBalancerRegions({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});


// Servers
export const useAllServersQuery = createQuery({
  queryPrimaryKey: "all-servers-query",
  queryFn: (ctx) => getAllServers({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useProjectsQuery = createQuery({
  queryPrimaryKey: "projects",
  queryFn: (ctx) => getProjects({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useServersProjectsQuery = createQuery({
  queryPrimaryKey: "servers-projects",
  queryFn: (ctx) => getServersProjects({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});


export const useServersStatusQuery = createQuery({
  queryPrimaryKey: "servers_status",
  queryKeyVariables: (vars: ServerStatusFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => getServersStatus(vars, { signal: ctx.signal }),
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
  queryFn: (ctx, vars) => getServerStatus(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});


export const useServerProjectsQuery = createQuery({
  queryPrimaryKey: "server-projects",
  queryKeyVariables: (vars: ServerFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => getServerProjects(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});


export const useServerHistoryQuery = createQuery({
  queryPrimaryKey: "server_history",
  queryKeyVariables: (vars: ServerHistoryFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => getServerHistory(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useServerPlotQuery = createQuery({
  queryPrimaryKey: "server_metric_plot",
  queryKeyVariables: (vars: ServerHistoryFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => getServerMetricPlotData(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useMetricsKeysQuery = createQuery({
  queryPrimaryKey: "server_metrics_keys",
  queryFn: (ctx) => getMetricsKeys({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useServerRegionsQuery = createQuery({
  queryPrimaryKey: "server_regions",
  queryFn: (ctx) => getServerRegions({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useServerTypesQuery = createQuery({
  queryPrimaryKey: "server_types",
  queryFn: (ctx) => getServerTypes({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

// Smart Retail API ----------------------------------------
export const useRetailStatusQuery = createQuery({
  queryPrimaryKey: "retail-devices",
  queryFn: (ctx, vars) => getRetailStatus({ signal: ctx.signal }),
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
  queryFn: (ctx, vars) => getRetailDeviceStatus(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
  refetchInterval: 60000,
  refetchIntervalInBackground: true
});

export const useRetailSeverityCount = createQuery({
  queryPrimaryKey: "retail_severity_count",
  queryFn: (ctx, vars) => getSmartRetailSeverityCount({ signal: ctx.signal }),
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
  queryFn: (ctx, vars) => getRetailDeviceLastStatusChange(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useRetailDeviceLogsQuery = createQuery({
  queryPrimaryKey: "retail-logs",
  queryKeyVariables: (vars: DeviceLogsFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => getRetailDeviceLogs(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});


export const useRetailDeviceHistoryQuery = createQuery({
  queryPrimaryKey: "retail-device-history",
  queryKeyVariables: (vars: DeviceFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => getRetailDeviceHistory(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useRetailDeviceSeverityHistory = createQuery({
  queryPrimaryKey: "severity-history",
  queryKeyVariables: (vars: RetailDeviceSeverityHistoryFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => getRetailDeviceSeverityHistory(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

export const useSmartRetailAreaPlotData = createQuery({
  queryPrimaryKey: "retail-area-plot-data",
  queryKeyVariables: (vars: AreaPlotFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => getSmartRetailAreaPlotData(vars, { signal: ctx.signal }),
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
  queryFn: (ctx, vars) => getSmartRetailClients({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
  refetchInterval: 60000,
  refetchIntervalInBackground: true
});
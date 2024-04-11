import { createQuery } from "../helpers/createQuery";
import { getUnits, getDevices, getUnitHistory, getDrivingSeverityCount, getUnitLastStatusChange, getDeviceHistory, getIndustrySeverityCount, getUnitStatus, getDeviceStatus, getSafeDrivingClients, getIndustryClients, getDeviceLastStatusChange, getIndustryCameraDisconnections, getUnitLastActiveStatus, getUnitSeverityHistory, getSafeDrivingAreaPlotData } from "../services/monitor";
import { AreaPlotFilters, DeviceFilters, SeverityHistoryFilters, UnitFilters } from "../services/monitor/types";
import defaultQueryClient from "../clients/defaultQueryClient";

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
  queryKeyVariables: (vars: SeverityHistoryFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => getUnitSeverityHistory(vars, { signal: ctx.signal }),
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
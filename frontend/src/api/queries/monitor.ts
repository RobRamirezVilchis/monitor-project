import { createQuery } from "../helpers/createQuery";
import { getUnits, getDevices, getUnitHistory, getDrivingSeverityCount, getLastUnitStatusChange, getDeviceHistory, getIndustrySeverityCount, getUnitStatus, getDeviceStatus } from "../services/monitor";
import { DeviceFilters, UnitFilters } from "../services/monitor/types";
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
});

export const useUnitLastStatusChange = createQuery({
  queryPrimaryKey: "last_status_change",
  queryKeyVariables: (vars: UnitFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => getLastUnitStatusChange(vars, { signal: ctx.signal }),
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
});
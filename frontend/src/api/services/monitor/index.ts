import { UnitStatus, SeverityCount, UnitHistory, DeviceStatus, UnitFilters, LastStatusChange, DeviceFilters, DeviceHistory } from "./types";
import { Id, Paginated } from "@/api/types";
import { Role, User } from "../auth/types";
import api from "../..";
import http from "@/api/http";

// Safe Driving API ----------------------------------------------------------

export async function getUnits(config?: Parameters<typeof http.get>[1]) {
  try {
    const resp = await http.get<UnitStatus[]>(
      api.endpoints.monitor.driving.status,
      {
        ...config,
      }
    );
    return resp.data;
  } catch (error) {
    throw error;
  }
}


export async function getDrivingSeverityCount(config?: Parameters<typeof http.get>[1]) {
  try {
    const resp = await http.get<SeverityCount[]>(
      api.endpoints.monitor.driving.severityCount,
      {
        ...config,
      }
    );
    return resp.data;
  } catch (error) {
    throw error;
  }
}


export async function getUnitStatus(
  filters: UnitFilters,
  config?: Parameters<typeof http.get>[1]
) {
  try {
    const resp = await http.get<UnitStatus>(
      api.endpoints.monitor.driving.unitStatus(filters.unit_id),
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;
  } catch (error) {
    throw error;
  }
}


export async function getUnitHistory(
  filters: UnitFilters,
  config?: Parameters<typeof http.get>[1]
) {
  try {
    const resp = await http.get<Paginated<UnitHistory>>(
      api.endpoints.monitor.driving.unitHistory(filters.unit_id),
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;
  } catch (error) {
    throw error;
  }
}


export async function getLastUnitStatusChange(
  filters: UnitFilters,
  config?: Parameters<typeof http.get>[1]
) {
  try {
    const resp = await http.get<LastStatusChange>(
      api.endpoints.monitor.driving.lastStatusChange(filters.unit_id),
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;
  } catch (error) {
    throw error;
  }
}

// Industry API ----------------------------------------------------------

export async function getDevices(config?: Parameters<typeof http.get>[1]) {
  try {
    const resp = await http.get<DeviceStatus[]>(
      api.endpoints.monitor.industry.status,
      {
        ...config,
      }
    );
    return resp.data;
  } catch (error) {
    throw error;
  }
}


export async function getDeviceStatus(
  filters: DeviceFilters,
  config?: Parameters<typeof http.get>[1]
) {
  try {
    const resp = await http.get<DeviceStatus>(
      api.endpoints.monitor.industry.deviceStatus(filters.device_id),
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;
  } catch (error) {
    throw error;
  }
}


export async function getDeviceHistory(
  filters: DeviceFilters,
  config?: Parameters<typeof http.get>[1]
) {
  try {
    const resp = await http.get<Paginated<DeviceHistory>>(
      api.endpoints.monitor.industry.deviceHistory(filters.device_id),
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;
  } catch (error) {
    throw error;
  }
}


export async function getIndustrySeverityCount(config?: Parameters<typeof http.get>[1]) {
  try {
    const resp = await http.get<SeverityCount[]>(
      api.endpoints.monitor.industry.severityCount,
      {
        ...config,
      }
    );
    return resp.data;
  } catch (error) {
    throw error;
  }
}
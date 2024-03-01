import { UnitStatus, SeverityCount, UnitHistory, DeviceStatus, UnitFilters } from "./types";
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

export async function getSeverityCount(config?: Parameters<typeof http.get>[1]) {
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

export async function getUnitHistory(
  filters: UnitFilters,
  config?: Parameters<typeof http.get>[1]
) {
  try {
    const resp = await http.get<Paginated<UnitHistory>>(
      api.endpoints.monitor.driving.unitHistory(filters.name),
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

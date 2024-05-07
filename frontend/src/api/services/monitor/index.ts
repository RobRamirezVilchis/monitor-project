import { UnitStatus, SeverityCount, UnitHistory, DeviceStatus, UnitFilters, LastStatusChange, DeviceFilters, DeviceHistory, Client, CameraDisconnection, LastActiveStatus, SeverityHistory, AreaPlotData, AreaPlotFilters, LastUpdate, DeviceLogsFilters, DeviceLogs, DeviceWifiStatus, UnitLogsFilters, UnitLogs, NewClientData, ServerStatus, ServerHistoryFilters, ServerHistory, MetricsKeys } from "./types";
import { Id, OptionallyPaginated, Paginated } from "@/api/types";
import { Role, User } from "../auth/types";
import api from "../..";
import http from "@/api/http";

// Safe Driving API ----------------------------------------------------------

export async function getUnits(config?: Parameters<typeof http.get>[1]) {

    const resp = await http.get<UnitStatus[]>(
      api.endpoints.monitor.driving.status,
      {
        ...config,
      }
    );
    return resp.data;

}

export async function getSafeDrivingClients(config?: Parameters<typeof http.get>[1]) {
    const resp = await http.get<Client[]>(
      api.endpoints.monitor.driving.clients,
      {
        ...config,
      }
    );
    return resp.data;
}

export async function addSafeDrivingClient(
  data: NewClientData,
  config?: Parameters<typeof http.post>[2]
) {
    const resp = await http.post<NewClientData>(
      api.endpoints.monitor.driving.addClient,
      data,
      config
    );
    return resp.data;
}



export async function getDrivingSeverityCount(config?: Parameters<typeof http.get>[1]) {

    const resp = await http.get<SeverityCount[]>(
      api.endpoints.monitor.driving.severityCount,
      {
        ...config,
      }
    );
  return resp.data
}

export async function getDrivingLastUpdate(config?: Parameters<typeof http.get>[1]) {

    const resp = await http.get<LastUpdate>(
      api.endpoints.monitor.driving.lastUpdate,
      {
        ...config,
      }
    );
  return resp.data
}


export async function getSafeDrivingAreaPlotData(
  filters: AreaPlotFilters, 
  config?: Parameters<typeof http.get>[1]
  ) {

    const resp = await http.get<AreaPlotData[]>(
      api.endpoints.monitor.driving.areaPlotData,
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;

}

export async function getIndustryAreaPlotData(
  filters: AreaPlotFilters, 
  config?: Parameters<typeof http.get>[1]
  ) {
  
    const resp = await http.get<AreaPlotData[]>(
      api.endpoints.monitor.industry.areaPlotData,
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;

}

export async function getUnitStatus(
  filters: UnitFilters,
  config?: Parameters<typeof http.get>[1]
) {

    const resp = await http.get<UnitStatus>(
      api.endpoints.monitor.driving.unitStatus(filters.unit_id),
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;

}


export async function getUnitHistory(
  filters: UnitFilters,
  config?: Parameters<typeof http.get>[1]
) {

    const resp = await http.get<Paginated<UnitHistory>>(
      api.endpoints.monitor.driving.unitHistory(filters.unit_id),
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;

}


export async function getUnitLastStatusChange(
  filters: UnitFilters,
  config?: Parameters<typeof http.get>[1]
) {

    const resp = await http.get<LastStatusChange>(
      api.endpoints.monitor.driving.lastStatusChange(filters.unit_id),
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;

}


export async function getUnitLastActiveStatus(
  filters: UnitFilters,
  config?: Parameters<typeof http.get>[1]
) {
  
    const resp = await http.get<LastActiveStatus>(
      api.endpoints.monitor.driving.lastActiveStatus(filters.unit_id),
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;

}


export async function setUnitAsInactive(
  filters: UnitFilters,
  config?: Parameters<typeof http.post>[2]
) {
 
    const resp = await http.post(
      api.endpoints.monitor.driving.setAsInactive(filters.unit_id),
      {
        ...config,
      }
    );
    return resp.data;

}


export async function getUnitSeverityHistory(
  filters: UnitFilters,
  config?: Parameters<typeof http.get>[1]
) {
 
    const resp = await http.get<SeverityHistory[]>(
      api.endpoints.monitor.driving.severityHistory(filters.unit_id),
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;

}


// Industry API ----------------------------------------------------------

export async function getDevices(config?: Parameters<typeof http.get>[1]) {

    const resp = await http.get<DeviceStatus[]>(
      api.endpoints.monitor.industry.status,
      {
        ...config,
      }
    );
    return resp.data;

}

export async function getIndustryClients(config?: Parameters<typeof http.get>[1]) {
 
    const resp = await http.get<Client[]>(
      api.endpoints.monitor.industry.clients,
      {
        ...config,
      }
    );
    return resp.data;

}

export async function addIndustryClient(
  data: NewClientData,
  config?: Parameters<typeof http.post>[2]
) {
  
    const resp = await http.post<NewClientData>(
      api.endpoints.monitor.industry.addClient,
      data,
      config
    );
    return resp.data;

}

export async function getDeviceStatus(
  filters: DeviceFilters,
  config?: Parameters<typeof http.get>[1]
) {
  
    const resp = await http.get<DeviceStatus>(
      api.endpoints.monitor.industry.deviceStatus(filters.device_id),
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;
 
}


export async function getDeviceHistory(
  filters: DeviceFilters,
  config?: Parameters<typeof http.get>[1]
) {
 
    const resp = await http.get<Paginated<DeviceHistory>>(
      api.endpoints.monitor.industry.deviceHistory(filters.device_id),
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;

}


export async function getIndustrySeverityCount(config?: Parameters<typeof http.get>[1]) {
  
    const resp = await http.get<SeverityCount[]>(
      api.endpoints.monitor.industry.severityCount,
      {
        ...config,
      }
    );
    return resp.data;

}

export async function getIndustryLastUpdate(config?: Parameters<typeof http.get>[1]) {

    const resp = await http.get<LastUpdate>(
      api.endpoints.monitor.industry.lastUpdate,
      {
        ...config,
      }
    );
    return resp.data;
 
}

export async function getDeviceLastStatusChange(
  filters: DeviceFilters,
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<LastStatusChange>(
      api.endpoints.monitor.industry.lastStatusChange(filters.device_id),
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;
}

export async function getDeviceWifiStatus(
  filters: DeviceFilters,
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<DeviceWifiStatus>(
      api.endpoints.monitor.industry.checkWifi(filters.device_id),
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;
}

export async function getIndustryCameraDisconnections(
  filters: DeviceFilters,
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<Paginated<CameraDisconnection>>(
      api.endpoints.monitor.industry.cameraDisconnections(filters.device_id),
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;
}

export async function setDeviceAsInactive(
  filters: DeviceFilters,
  config?: Parameters<typeof http.post>[2]
) {
 
    const resp = await http.post(
      api.endpoints.monitor.industry.setAsInactive(filters.device_id),
      {
        ...config,
      }
    );
    return resp.data;

}

export async function getDeviceSeverityHistory(
  filters: DeviceFilters,
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<SeverityHistory[]>(
      api.endpoints.monitor.industry.severityHistory(filters.device_id),
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;
}

export async function getUnitLogs(
  filters: UnitLogsFilters,
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<Paginated<UnitLogs>>(
      api.endpoints.monitor.driving.unitLogs(filters.unit_id),
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;
}

export async function getDeviceLogs(
  filters: DeviceLogsFilters,
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<Paginated<DeviceLogs>>(
      api.endpoints.monitor.industry.deviceLogs(filters.device_id),
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;
}


// Servers
export async function getServersStatus(
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<ServerStatus[]>(
      api.endpoints.monitor.servers.status,
      {
        ...config,
      }
    );
    return resp.data;
}

export async function getServerStatus(
  filters: ServerHistoryFilters,
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<ServerStatus>(
      api.endpoints.monitor.servers.serverStatus(filters.server_id),
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;
}

export async function getServerHistory(
  filters: ServerHistoryFilters,
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<Paginated<ServerHistory>>(
      api.endpoints.monitor.servers.serverHistory(filters.server_id),
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;
}


export async function getServerMetricPlotData(
  filters: ServerHistoryFilters,
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<ServerHistory[]>(
      api.endpoints.monitor.servers.serverHistory(filters.server_id),
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;
}



export async function getMetricsKeys(
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<MetricsKeys>(
      api.endpoints.monitor.servers.metricsKeys,
      {
        ...config,
      }
    );
    return resp.data;
}
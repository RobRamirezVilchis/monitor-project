import { UnitStatus, SeverityCount, UnitHistory, DeviceStatus, UnitFilters, LastStatusChange, DeviceFilters, DeviceHistory, Client, CameraDisconnection, LastActiveStatus, StatusHistory, AreaPlotData, AreaPlotFilters, LastUpdate, DeviceLogsFilters, DeviceLogs, DeviceWifiStatus, UnitLogsFilters, UnitLogs, NewClientData, ServerStatus, ServerHistoryFilters, ServerHistory, MetricsKeys, ServerRegion, ServerType, ServerStatusFilters, RetailDeviceStatus, RetailDeviceHistory, UnitReportContent, RDSStatusFilters, RDSStatus, RDSHistoryFilters, RDSHistory, RDSType, RDSFilters, RDS, Server, Deployment, NewProjectData, ServerProjects, Project, LoadBalancer, LoadBalancerStatusFilters, LoadBalancerStatus, LoadBalancerFilters, LoadBalancerHistoryFilters, LoadBalancerHistory, ServerFilters, ModifyProjectsData, UnitFailedTrips, UnitTrip, UnitSeverityHistoryFilters, ProjectData, EditedProjectData, RDSProjects, ServiceSeverityHistory } from "./types";
import { Id, OptionallyPaginated, Paginated } from "@/api/types";
import { Role, User } from "../auth/types";
import api from "../..";
import http from "@/api/http";


export async function getDeployments(config?: Parameters<typeof http.get>[1]) {

  const resp = await http.get<Deployment[]>(
    api.endpoints.monitor.deployments,
    {
      ...config,
    }
  );
  return resp.data;

}



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

export async function getUnitReportContent(
  filters: UnitFilters, 
  config?: Parameters<typeof http.get>[1]
) {
  const resp = await http.get<UnitReportContent>(
    api.endpoints.monitor.driving.unitReport(filters.unit_id),
    {...config}
  );
  return resp.data;
}

export async function getUnitFailedTrips(
  filters: UnitFilters,
  config?: Parameters<typeof http.get>[1]
) {

    const resp = await http.get<UnitFailedTrips>(
      api.endpoints.monitor.driving.unitFailedTrips(filters.unit_id),
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
  filters: UnitSeverityHistoryFilters,
  config?: Parameters<typeof http.get>[1]
) {
 
    const resp = await http.get<StatusHistory[]>(
      api.endpoints.monitor.driving.severityHistory(filters.unit_id),
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;

}

export async function getUnitTrips(
  filters: UnitSeverityHistoryFilters,
  config?: Parameters<typeof http.get>[1]
) {
 
    const resp = await http.get<UnitTrip[]>(
      api.endpoints.monitor.driving.trips(filters.unit_id),
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
    const resp = await http.get<StatusHistory[]>(
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
export async function getAllServers(
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<Server[]>(
      api.endpoints.monitor.servers.list,
      {
        ...config,
      }
    );
    return resp.data;
}

export async function getProjects(
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<Project[]>(
      api.endpoints.monitor.servers.projects,
      {
        ...config,
      }
    );
    return resp.data;
}

export async function getServersProjects(
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<ServerProjects[]>(
      api.endpoints.monitor.servers.serversProjects,
      {
        ...config,
      }
    );
    return resp.data;
}

export async function getServersStatus(
  filters: ServerStatusFilters,
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<ServerStatus[]>(
      api.endpoints.monitor.servers.status,
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;
}

export async function getServerStatus(
  filters: ServerFilters,
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

export async function getServerProjects(
  filters: ServerFilters,
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<Project[]>(
      api.endpoints.monitor.servers.serverProjects(filters.server_id),
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


export async function getServerSeverityHistory(
  filters: ServerHistoryFilters,
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<ServiceSeverityHistory[]>(
      api.endpoints.monitor.servers.severityHistory(filters.server_id),
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



export async function getServerRegions(
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<ServerRegion[]>(
      api.endpoints.monitor.servers.regions,
      {
        ...config,
      }
    );
    return resp.data;
}

export async function getServerTypes(
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<ServerType[]>(
      api.endpoints.monitor.servers.serverTypes,
      {
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

// RDS
export async function getAllRDS(
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<RDS[]>(
      api.endpoints.monitor.rds.list,
      {
        ...config,
      }
    );
    return resp.data;
}

export async function getAllRDSStatus(
  filters: RDSStatusFilters,
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<RDSStatus[]>(
      api.endpoints.monitor.rds.status,
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;
}

export async function getAllRDSProjects(
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<RDSProjects[]>(
      api.endpoints.monitor.rds.allRDSProjects,
      {
        ...config,
      }
    );
    return resp.data;
}

export async function getRDSStatus(
  filters: RDSFilters,
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<RDSStatus>(
      api.endpoints.monitor.rds.RDSStatus(filters.rds_id),
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;
}

export async function getRDSHistory(
  filters: RDSHistoryFilters,
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<Paginated<RDSHistory>>(
      api.endpoints.monitor.rds.RDSHistory(filters.rds_id),
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;
}

export async function getRDSSeverityHistory(
  filters: RDSHistoryFilters,
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<ServiceSeverityHistory[]>(
      api.endpoints.monitor.rds.severityHistory(filters.rds_id),
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;
}


export async function getRDSMetricPlotData(
  filters: RDSHistoryFilters,
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<RDSHistory[]>(
      api.endpoints.monitor.rds.RDSHistory(filters.rds_id),
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;
}



export async function getRDSRegions(
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<ServerRegion[]>(
      api.endpoints.monitor.rds.regions,
      {
        ...config,
      }
    );
    return resp.data;
}

export async function getRDSTypes(
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<RDSType[]>(
      api.endpoints.monitor.rds.RDSTypes,
      {
        ...config,
      }
    );
    return resp.data;
}

export async function getRDSMetricsKeys(
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<MetricsKeys>(
      api.endpoints.monitor.rds.RDSMetricsKeys,
      {
        ...config,
      }
    );
    return resp.data;
}

// Load Balancers
export async function getAllLoadBalancers(
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<LoadBalancer[]>(
      api.endpoints.monitor.elb.list,
      {
        ...config,
      }
    );
    return resp.data;
}

export async function getAllLoadBalancerStatus(
  filters: LoadBalancerStatusFilters,
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<LoadBalancerStatus[]>(
      api.endpoints.monitor.elb.status,
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;
}

export async function getLoadBalancerStatus(
  filters: LoadBalancerFilters,
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<LoadBalancerStatus>(
      api.endpoints.monitor.elb.loadBalancerStatus(filters.elb_id),
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;
}

export async function getLoadBalancerHistory(
  filters: LoadBalancerHistoryFilters,
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<Paginated<LoadBalancerHistory>>(
      api.endpoints.monitor.elb.loadBalancerHistory(filters.elb_id),
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;
}



export async function getLoadBalancerSeverityHistory(
  filters: LoadBalancerHistoryFilters,
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<ServiceSeverityHistory[]>(
      api.endpoints.monitor.elb.severityHistory(filters.elb_id),
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;
}


export async function getLoadBalancerMetricPlotData(
  filters: LoadBalancerHistoryFilters,
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<LoadBalancerHistory[]>(
      api.endpoints.monitor.elb.loadBalancerHistory(filters.elb_id),
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;
}



export async function getLoadBalancerRegions(
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<ServerRegion[]>(
      api.endpoints.monitor.elb.regions,
      {
        ...config,
      }
    );
    return resp.data;
}

export async function getLoadBalancerMetricsKeys(
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<MetricsKeys>(
      api.endpoints.monitor.elb.metricsKeys,
      {
        ...config,
      }
    );
    return resp.data;
}

// Smart Retail
export async function getRetailStatus(config?: Parameters<typeof http.get>[1]) {

  const resp = await http.get<RetailDeviceStatus[]>(
    api.endpoints.monitor.retail.status,
    {
      ...config,
    }
  );
  return resp.data;

}


export async function getRetailDeviceStatus(filters: DeviceFilters, config?: Parameters<typeof http.get>[1]) {

  const resp = await http.get<RetailDeviceStatus>(
    api.endpoints.monitor.retail.deviceStatus(filters.device_id),
    {
      params: filters,
      ...config,
    }
  );
  return resp.data;

}

export async function addSmartRetailClient(
  data: NewClientData,
  config?: Parameters<typeof http.post>[2]
) {
  
    const resp = await http.post<NewClientData>(
      api.endpoints.monitor.retail.addClient,
      data,
      config
    );
    return resp.data;

}

export async function getSmartBuildingsAreaPlotData(
  filters: AreaPlotFilters, 
  config?: Parameters<typeof http.get>[1]
  ) {
  
    const resp = await http.get<AreaPlotData[]>(
      api.endpoints.monitor.smartBuildings.areaPlotData,
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;

}

export async function getSmartRetailSeverityCount(config?: Parameters<typeof http.get>[1]) {
  
  const resp = await http.get<SeverityCount[]>(
    api.endpoints.monitor.retail.severityCount,
    {
      ...config,
    }
  );
  return resp.data;

}

export async function getRetailDeviceLastStatusChange(
  filters: DeviceFilters,
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<LastStatusChange>(
      api.endpoints.monitor.retail.lastStatusChange(filters.device_id),
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;
}

export async function getRetailDeviceLogs(
  filters: DeviceLogsFilters,
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<Paginated<DeviceLogs>>(
      api.endpoints.monitor.retail.deviceLogs(filters.device_id),
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;
}

export async function getRetailDeviceHistory(
  filters: DeviceFilters,
  config?: Parameters<typeof http.get>[1]
) {
 
    const resp = await http.get<Paginated<RetailDeviceHistory>>(
      api.endpoints.monitor.retail.deviceHistory(filters.device_id),
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;

}

export async function getRetailDeviceSeverityHistory(
  filters: DeviceFilters,
  config?: Parameters<typeof http.get>[1]
) {
    const resp = await http.get<StatusHistory[]>(
      api.endpoints.monitor.retail.severityHistory(filters.device_id),
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;
}

export async function getSmartRetailAreaPlotData(
  filters: AreaPlotFilters, 
  config?: Parameters<typeof http.get>[1]
  ) {
  
    const resp = await http.get<AreaPlotData[]>(
      api.endpoints.monitor.retail.areaPlotData,
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;

}

export async function getSmartRetailClients(config?: Parameters<typeof http.get>[1]) {
  const resp = await http.get<Client[]>(
    api.endpoints.monitor.retail.clients,
    {
      ...config,
    }
  );
  return resp.data;
}


// Smart Buildings API ----------------------------------------------------------

export async function getSBDevices(config?: Parameters<typeof http.get>[1]) {

  const resp = await http.get<DeviceStatus[]>(
    api.endpoints.monitor.smartBuildings.status,
    {
      ...config,
    }
  );
  return resp.data;

}

export async function getSmartBuildingsClients(config?: Parameters<typeof http.get>[1]) {

  const resp = await http.get<Client[]>(
    api.endpoints.monitor.smartBuildings.clients,
    {
      ...config,
    }
  );
  return resp.data;

}

export async function addSmartBuildingsClient(
data: NewClientData,
config?: Parameters<typeof http.post>[2]
) {

  const resp = await http.post<NewClientData>(
    api.endpoints.monitor.smartBuildings.addClient,
    data,
    config
  );
  return resp.data;

}

export async function getSBDeviceStatus(
filters: DeviceFilters,
config?: Parameters<typeof http.get>[1]
) {

  const resp = await http.get<DeviceStatus>(
    api.endpoints.monitor.smartBuildings.deviceStatus(filters.device_id),
    {
      params: filters,
      ...config,
    }
  );
  return resp.data;

}


export async function getSBDeviceHistory(
filters: DeviceFilters,
config?: Parameters<typeof http.get>[1]
) {

  const resp = await http.get<Paginated<DeviceHistory>>(
    api.endpoints.monitor.smartBuildings.deviceHistory(filters.device_id),
    {
      params: filters,
      ...config,
    }
  );
  return resp.data;

}


export async function getSmartBuildingsSeverityCount(config?: Parameters<typeof http.get>[1]) {

  const resp = await http.get<SeverityCount[]>(
    api.endpoints.monitor.smartBuildings.severityCount,
    {
      ...config,
    }
  );
  return resp.data;

}

export async function getSmartBuildingsLastUpdate(config?: Parameters<typeof http.get>[1]) {

  const resp = await http.get<LastUpdate>(
    api.endpoints.monitor.smartBuildings.lastUpdate,
    {
      ...config,
    }
  );
  return resp.data;

}

export async function getSBDeviceLastStatusChange(
filters: DeviceFilters,
config?: Parameters<typeof http.get>[1]
) {
  const resp = await http.get<LastStatusChange>(
    api.endpoints.monitor.smartBuildings.lastStatusChange(filters.device_id),
    {
      params: filters,
      ...config,
    }
  );
  return resp.data;
}

export async function getSBDeviceWifiStatus(
filters: DeviceFilters,
config?: Parameters<typeof http.get>[1]
) {
  const resp = await http.get<DeviceWifiStatus>(
    api.endpoints.monitor.smartBuildings.checkWifi(filters.device_id),
    {
      params: filters,
      ...config,
    }
  );
  return resp.data;
}

export async function getSmartBuildingsCameraDisconnections(
filters: DeviceFilters,
config?: Parameters<typeof http.get>[1]
) {
  const resp = await http.get<Paginated<CameraDisconnection>>(
    api.endpoints.monitor.smartBuildings.cameraDisconnections(filters.device_id),
    {
      params: filters,
      ...config,
    }
  );
  return resp.data;
}

export async function setSBDeviceAsInactive(
filters: DeviceFilters,
config?: Parameters<typeof http.post>[2]
) {

  const resp = await http.post(
    api.endpoints.monitor.smartBuildings.setAsInactive(filters.device_id),
    {
      ...config,
    }
  );
  return resp.data;

}

export async function getSBDeviceSeverityHistory(
filters: DeviceFilters,
config?: Parameters<typeof http.get>[1]
) {
  const resp = await http.get<StatusHistory[]>(
    api.endpoints.monitor.smartBuildings.severityHistory(filters.device_id),
    {
      params: filters,
      ...config,
    }
  );
  return resp.data;
}


export async function getSBDeviceLogs(
filters: DeviceLogsFilters,
config?: Parameters<typeof http.get>[1]
) {
  const resp = await http.get<Paginated<DeviceLogs>>(
    api.endpoints.monitor.smartBuildings.deviceLogs(filters.device_id),
    {
      params: filters,
      ...config,
    }
  );
  return resp.data;
}


// Server Projects API ----------------------------------------------------


export async function addNewProject(
  data: NewProjectData,
  config?: Parameters<typeof http.post>[2]
) {
  
    const resp = await http.post<NewProjectData>(
      api.endpoints.monitor.servers.newProject,
      data,
      config
    );
    return resp.data;

}

export async function editProject(
  data: EditedProjectData,
  config?: Parameters<typeof http.post>[2]
) {
  
    const resp = await http.post<ProjectData>(
      api.endpoints.monitor.servers.editProject(data.id),
      data,
      config
    );
    return resp.data;

}

export async function deleteProject(
  data: {id: number},
  config?: Parameters<typeof http.post>[2]
) {
  
    const resp = await http.post<ProjectData>(
      api.endpoints.monitor.servers.deleteProject(data.id),
    );
    return resp.data;

}

export async function getProjectData(
  project_id: number,
  config?: Parameters<typeof http.get>[1]
) {
  
    const resp = await http.get<ProjectData>(
      api.endpoints.monitor.servers.projectData(project_id),
      config
    );
    return resp.data;
}

export async function modifyServerProjects(
  data: ModifyProjectsData,
  config?: Parameters<typeof http.post>[2]
) {
  const resp = await http.post<ModifyProjectsData>(
    api.endpoints.monitor.servers.modifyProjects(data.server_id), 
    data,
    config
  );
  return resp.data;
}
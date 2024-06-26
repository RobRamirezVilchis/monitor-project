import { DeviceId, Id, UnitId } from "./types";

const baseBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const api = {
  baseURL: baseBackendUrl,
  endpoints: {
    auth: {
      // https://dj-rest-auth.readthedocs.io/en/latest/api_endpoints.html
      login: "/api/v1/auth/login/",
      tokenVerify: "/api/v1/auth/token/verify/",
      tokenRefresh: "/api/v1/auth/token/refresh/",
      social: {
        google: {
          login: "/api/v1/auth/social/google/",
          connect: "/api/v1/auth/social/google/connect/",
        },
      },
      connectedSocialAccounts: "/api/v1/auth/socialaccounts/",
      disconnectSocialAccount: (socialAccountId: Id) => `/api/v1/auth/socialaccounts/${socialAccountId}/disconnect/`,
      register: "/api/v1/auth/register/",
      registerTokenValidity: "/api/v1/auth/register/token-valid/",
      registerVerifyEmail: "/api/v1/auth/register/verify-email/",
      registerResendEmail: "/api/v1/auth/register/resend-email/",
      logout: "/api/v1/auth/logout/",
      user: "/api/v1/auth/user/",
      passwordResetRequest: "/api/v1/auth/password/reset/",
      passwordResetValidity: "/api/v1/auth/password/reset-token-valid/",
      passwordResetConfirm: "/api/v1/auth/password/reset/confirm/",
      passwordChange: "/api/v1/auth/password/change/",
    },
    users: {
      list: "/api/v1/users/",
      create: "/api/v1/users/",
      update: (id: Id) => `/api/v1/users/${id}/`,
      delete: (id: Id) => `/api/v1/users/${id}/`,
      roles: {
        list: "/api/v1/users/roles/",
      },
      whitelist: {
        list: "/api/v1/users/whitelist/",
        create: "/api/v1/users/whitelist/",
        update: (id: Id) => `/api/v1/users/whitelist/${id}/`,
        delete: (id: Id) => `/api/v1/users/whitelist/${id}/`,
      },
      access: {
        list: "/api/v1/users/access/",
      }
    },
    monitor: {
      deployments: "api/v1/monitor/deployments/",
      driving: {
        clients: "api/v1/monitor/driving/clients/",
        addClient: "api/v1/monitor/driving/clients/create/",
        status: "api/v1/monitor/driving/status/",
        lastUpdate: "api/v1/monitor/driving/last-update/",
        severityCount: "api/v1/monitor/driving/status-count/",
        areaPlotData: "api/v1/monitor/driving/area-plot-data/",
        unitStatus: (unit_id: UnitId) => `api/v1/monitor/driving/units/${unit_id}/`,
        unitFailedTrips: (unit_id: UnitId) => `api/v1/monitor/driving/units/${unit_id}/failed-trips/`,
        unitReport: (unit_id: UnitId) => `api/v1/monitor/driving/units/${unit_id}/report/`,
        unitHistory: (unit_id: UnitId) => `api/v1/monitor/driving/units/${unit_id}/history/`,
        lastStatusChange: (unit_id: UnitId) => `api/v1/monitor/driving/units/${unit_id}/last-status-change/`,
        lastActiveStatus: (unit_id: UnitId) => `api/v1/monitor/driving/units/${unit_id}/last-active-status/`,
        severityHistory: (unit_id: UnitId) => `api/v1/monitor/driving/units/${unit_id}/severity-history/`,
        trips: (unit_id: UnitId) => `api/v1/monitor/driving/units/${unit_id}/trips/`,
        unitLogs: (unit_id: UnitId) => `api/v1/monitor/driving/units/${unit_id}/logs/`,
        setAsInactive: (unit_id: UnitId) => `api/v1/monitor/driving/units/${unit_id}/set-inactive/`,
      },
      industry: {
        clients: "api/v1/monitor/industry/clients/",
        addClient: "api/v1/monitor/industry/clients/create/",
        status: "api/v1/monitor/industry/status/",
        lastUpdate: "api/v1/monitor/industry/last-update",
        severityCount: "api/v1/monitor/industry/status-count/",
        areaPlotData: "api/v1/monitor/industry/area-plot-data/",
        deviceStatus: (device_id: DeviceId) => `api/v1/monitor/industry/devices/${device_id}/`,
        deviceHistory: (device_id: DeviceId) => `api/v1/monitor/industry/devices/${device_id}/history/`,
        lastStatusChange: (device_id: DeviceId) => `api/v1/monitor/industry/devices/${device_id}/last-status-change/`,
        severityHistory: (device_id: DeviceId) => `api/v1/monitor/industry/devices/${device_id}/severity-history/`,
        deviceLogs: (device_id: DeviceId) => `api/v1/monitor/industry/devices/${device_id}/logs/`,
        cameraDisconnections: (device_id: DeviceId) => `api/v1/monitor/industry/devices/${device_id}/camera-disconnections/`,
        checkWifi: (device_id: DeviceId) => `api/v1/monitor/industry/devices/${device_id}/check-wifi-connection/`,
        setAsInactive: (device_id: DeviceId) => `api/v1/monitor/industry/devices/${device_id}/set-inactive/`,
      },
      retail: {
        status: "api/v1/monitor/retail/status/",
        clients: "api/v1/monitor/retail/clients/",
        addClient: "api/v1/monitor/retail/clients/create/",
        severityCount: "api/v1/monitor/retail/status-count/",
        areaPlotData: "api/v1/monitor/retail/area-plot-data/",
        deviceStatus: (device_id: DeviceId) => `api/v1/monitor/retail/devices/${device_id}/`,
        lastStatusChange: (device_id: DeviceId) => `api/v1/monitor/retail/devices/${device_id}/last-status-change/`,
        deviceLogs: (device_id: DeviceId) => `api/v1/monitor/retail/devices/${device_id}/logs/`,
        deviceHistory: (device_id: DeviceId) => `api/v1/monitor/retail/devices/${device_id}/history/`,
        severityHistory: (device_id: DeviceId) => `api/v1/monitor/retail/devices/${device_id}/severity-history/`,

      },
      servers: {
        list: "api/v1/monitor/servers/list/",
        serversProjects: "api/v1/monitor/servers/server-projects/",
        projects: "api/v1/monitor/servers/projects/",
        newProject: "api/v1/monitor/servers/new-project/",
        status: "api/v1/monitor/servers/status/",
        metricsKeys: "api/v1/monitor/servers/metric-keys/",
        serverTypes: "api/v1/monitor/servers/types/",
        regions: "api/v1/monitor/servers/regions/",
        serverStatus: (server_id: string) => `api/v1/monitor/servers/server/${server_id}/`,
        serverHistory: (device_id: DeviceId) => `api/v1/monitor/servers/server/${device_id}/history/`,
        modifyProjects: (server_id: string) => `api/v1/monitor/servers/server/${server_id}/modify-projects/`,
        serverProjects: (server_id: string) => `api/v1/monitor/servers/server/${server_id}/projects/`,
      },
      rds: {
        list: "api/v1/monitor/rds/list/",
        status: "api/v1/monitor/rds/status/",
        RDSMetricsKeys: "api/v1/monitor/rds/metric-keys/",
        RDSTypes: "api/v1/monitor/rds/types/",
        regions: "api/v1/monitor/rds/regions/",
        RDSStatus: (server_id: string) => `api/v1/monitor/rds/db/${server_id}/`,
        RDSHistory: (device_id: DeviceId) => `api/v1/monitor/rds/db/${device_id}/history/`,
      },
      elb: {
        list: "api/v1/monitor/load-balancers/list/",
        status: "api/v1/monitor/load-balancers/status/",
        metricsKeys: "api/v1/monitor/load-balancers/metric-keys/",
        regions: "api/v1/monitor/load-balancers/regions/",
        loadBalancerStatus: (elb_id: string) => `api/v1/monitor/load-balancers/elb/${elb_id}/`,
        loadBalancerHistory: (elb_id: DeviceId) => `api/v1/monitor/load-balancers/elb/${elb_id}/history/`,
      }
    }
  },
};

export default api;

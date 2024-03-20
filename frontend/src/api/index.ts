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
      driving: {
        clients: "api/v1/monitor/driving/clients/",
        status: "api/v1/monitor/driving-status/",
        lastStatusChange: (unit_id: UnitId) => `api/v1/monitor/driving-status/last-status-change/${unit_id}/`,
        unitStatus: (unit_id: UnitId) => `api/v1/monitor/driving-status/${unit_id}/`,
        unitHistory: (unit_id: UnitId) => `api/v1/monitor/driving-status/history/${unit_id}/`,
        severityCount: "api/v1/monitor/driving-status-count/"
      },
      industry: {
        clients: "api/v1/monitor/industry/clients/",
        status: "api/v1/monitor/industry-status/",
        deviceStatus: (device_id: DeviceId) => `api/v1/monitor/industry-status/${device_id}/`,
        deviceHistory: (device_id: DeviceId) => `api/v1/monitor/industry-status/history/${device_id}/`,
        severityCount: "api/v1/monitor/industry-status-count/"
      }
    }
  },
};

export default api;

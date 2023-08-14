import axios from "axios";
import Cookies from "js-cookie";

import api from "@/api";
import { getOrRefreshAccessToken, jwtCookie, useJwt } from "@/api/auth";
import type { AxiosInstance as AxiosInstanceBase, AxiosRequestConfig as AxiosRequestConfigBase, InternalAxiosRequestConfig } from "./axios.types";
import { sleep } from "@/utils/utils";

export const csrfTokenName = "csrftoken_django";

// declare module "axios" {
//   export interface AxiosRequestConfig {
//     myConfig?: string;
//   }
// }

export interface ExtraHttpProps {
  setCsrfToken?: boolean;
  setJwtToken?: boolean;
  rejectRequest?: false | ((config: InternalAxiosRequestConfig<ExtraHttpProps>) => 
    { response: any, config: InternalAxiosRequestConfig<ExtraHttpProps> } | false);
  onError?: false | ((error: any) => any);
  retries?: number;
  retryDelay?: number;
  retryIf?: (error: any) => boolean;
  delay?: number;
}

export type AxiosRequestConfig = AxiosRequestConfigBase<ExtraHttpProps>;

export type AxiosInstance = AxiosInstanceBase<ExtraHttpProps>;

export const axiosConfig: AxiosRequestConfig = {
  baseURL: api.baseURL,
  withCredentials: true,
  setCsrfToken: true,
  setJwtToken: true,
  rejectRequest: (config) => {
    if (!hasCSRFToken(config)) {
      return {
        response: {
          status: 401,
          statusText: "Unauthorized",
        },
        config,
      };
    }

    return false;
  },
  onError: (error) => {
    if (!error.config || !error.config.retries 
      && (error?.response?.status === 401 || error?.response?.status === 403)) {
      const url = new URL("/auth/login", window.location.origin);
      const query = new URLSearchParams({
        callbackUrl: window.location.href,
      });
      url.search = query.toString();
      window.location.assign(url.toString());
    }

    throw error;
  },
  retries: 0,
  retryDelay: 500,
  retryIf: (_) => true,
};

const axiosInstance = axios.create(axiosConfig) as AxiosInstance;

// Reject request interceptor
axiosInstance.interceptors.request.use(async (config) => {
  const reject = config?.rejectRequest && config?.rejectRequest(config);
  if (reject) throw reject;
  return config;
});

// JWT Token interceptor
axiosInstance.interceptors.request.use(async (config) => {
  const conf =  config.withCredentials ? await setJwtAuthorizationHeader(config) : config;
  return conf;
}, undefined, { runWhen: (config) => !!config.setJwtToken });

// CSRF Token interceptor
axiosInstance.interceptors.request.use((config) => {
  return config.withCredentials ? setCSRFTokenHeader(config) : config;
}, undefined, { synchronous: true, runWhen: (config) => !!config.setCsrfToken }); 

// Delay interceptor
axiosInstance.interceptors.request.use(async (config) => {
  if (config?.delay && config.delay > 0)
    await sleep(config.delay);

  return config;
}, undefined, { runWhen: (config) => !!config.delay });

// Error interceptor
axiosInstance.interceptors.response.use(undefined, (error) => {
  if (error.config?.onError)
    return error.config?.onError(error);

  throw error;
});

// Retry interceptor
axiosInstance.interceptors.response.use(undefined, async (error) => {
  if (error.config?.retries && error.config?.retries > 0 && error.config?.retryIf?.(error)) {
    if (error.config?.retryDelay)
      await sleep(error.config.retryDelay);
    return axiosInstance({
      ...error.config,
      retries: error.config.retries - 1,
    });
  }

  throw error;
});

export default axiosInstance;


// Utility

function setCSRFTokenHeader(config?: InternalAxiosRequestConfig<any>): InternalAxiosRequestConfig<any> {
  let conf = config as any;
  
  if (!conf) 
    conf = {};
  
  const csrfToken = Cookies.get(csrfTokenName);

  if (csrfToken) {
    if (!conf.headers) 
      conf.headers = {};
    conf.headers["X-CSRFToken"] = csrfToken;
  }
  
  conf.withCredentials = true;

  return conf as InternalAxiosRequestConfig<ExtraHttpProps>;
}

function hasCSRFToken(config: InternalAxiosRequestConfig<ExtraHttpProps>) {
  return config?.headers && config.headers["X-CSRFToken"];
}

async function setJwtAuthorizationHeader(config?: InternalAxiosRequestConfig<ExtraHttpProps>): Promise<InternalAxiosRequestConfig<ExtraHttpProps>> {
  let conf = config as any;
  
  if (!conf) 
    conf = {};

  if (!useJwt) return conf;
  
  const accessToken = await getOrRefreshAccessToken();

  if (accessToken && !jwtCookie) {
    if (!conf.headers) 
      conf.headers = {};
    conf.headers["Authorization"] = `Bearer ${accessToken}`;
  }

  return conf as InternalAxiosRequestConfig<ExtraHttpProps>;
}

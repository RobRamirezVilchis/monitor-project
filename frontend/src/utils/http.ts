import axios from "axios";
import Cookies from "js-cookie";

import api from "./api";
import { getOrRefreshAccessToken, jwtCookie, useJwt } from "./auth/auth.utils";
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from "./axios.types";

export const csrfTokenName = "csrftoken_django";

// declare module "axios" {
//   export interface AxiosRequestConfig {
//     myConfig?: string;
//   }
// }

export interface ExtraHttpProps {
  setCsrfToken?: boolean;
  setJwtToken?: boolean;
  rejectRequest?: (config: InternalAxiosRequestConfig<ExtraHttpProps>) => 
    { response: any, config: InternalAxiosRequestConfig<ExtraHttpProps> } | false;
  onError?: (error: any) => void;
  retries?: number;
  retryDelay?: number;
  retryIf?: (error: any) => boolean;
}

export const axiosConfig: AxiosRequestConfig<ExtraHttpProps> = {
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
    if (!error.config || !error.config.retries && (!hasCSRFToken(error.config) 
      || error.response.status === 401 || error.response.status === 403)) {
      const url = new URL("/auth/login", window.location.origin);
      const query = new URLSearchParams({
        callbackUrl: window.location.href,
      });
      url.search = query.toString();
      window.location.href = url.toString();
    }

    throw error;
  },
  retries: 0,
  retryDelay: 500,
  retryIf: (error) => true,
};

const axiosInstance = axios.create(axiosConfig) as AxiosInstance<ExtraHttpProps>;

// Reject request interceptor
axiosInstance.interceptors.request.use(async (config) => {
  const reject = config?.rejectRequest?.(config);
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

// Error interceptor
axiosInstance.interceptors.response.use(undefined, (error) => {
  error.config?.onError?.(error);

  return error;
});

// Retry interceptor
axiosInstance.interceptors.response.use(undefined, async (error) => {
  if (error.config?.retries && error.config?.retries > 0 && error.config?.retryIf?.(error)) {
    await new Promise((resolve) => setTimeout(resolve, error.config?.retryDelay));
    return axiosInstance({
      ...error.config,
      retries: error.config.retries - 1,
    });
  }

  throw error;
});

export default axiosInstance;

// -------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------

/**
 * Base instance that includes the base url of the api, 
 * the csrf_token and withCredentials set to true
 */
export const axiosBase = axios.create(axiosConfig) as AxiosInstance;

axiosBase.interceptors.request.use(async (config) => {
  return setCSRFTokenHeader(config); 
});

/**
 * Same as axios Base but throws a 401 error code if no csrf_token exist
 */
export const axiosError = axios.create(axiosConfig);

axiosError.interceptors.request.use(async (config) => {
  let conf = setCSRFTokenHeader(config);

  if (!hasCSRFToken(conf)) {
    return Promise.reject({
      response: {
        status: 401,
        statusText: "Unauthorized",
      },
    });
  }

  conf = await setJwtAuthorizationHeader(config);

  return conf;
});

/**
 * Same as axiosError but redirects the client to the login page on authentication/authorization 
 * errors, including the one thrown by not having the csrf_token
 */
export const axiosRedirectOnError = axios.create(axiosConfig);

axiosRedirectOnError.interceptors.request.use(async (config) => {
  let conf = setCSRFTokenHeader(config);

  if (!hasCSRFToken(conf)) {
    const url = new URL("/auth/login", window.location.origin);
    const query = new URLSearchParams({
      callbackUrl: window.location.href
    });
    url.search = query.toString();
    window.location.href = url.toString();

    return Promise.reject({
      response: {
        status: 401,
        statusText: "Unauthorized",
      },
    });
  }

  conf = await setJwtAuthorizationHeader(config);

  return conf;
});

axiosRedirectOnError.interceptors.response.use(
  undefined,
  (error) => {
    if (
      error.response &&
      (error.response.status == 401 || error.response.status == 403)
    ) {
      const url = new URL("/auth/login", window.location.origin);
      const query = new URLSearchParams({
        callbackUrl: window.location.href
      });
      url.search = query.toString();
      window.location.href = url.toString();
    }

    throw error;
  },
  { synchronous: true }
);

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
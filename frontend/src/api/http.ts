import Cookies from "js-cookie";

import type { 
    AxiosInstance as AxiosInstanceBase, 
    AxiosRequestConfig as AxiosRequestConfigBase, 
    InternalAxiosRequestConfig 
} from "@/utils/http/axios.types";
import {
    ExtraAxiosConfig,
    addDelayInterceptor,
    addErrorInterceptor,
    addRejectRequestInterceptor,
    addRetryInterceptor,
    createAxiosInstance,
    defaultExtraConfig,
} from "@/utils/http/axios";
import { refreshToken } from "./auth";
import api from "./";
import jwt from "./jwt";

export interface HttpClientExtraConfig {
  /**
   * Set the CSRF token in the CSRF header
   * @default true
   */
  useCSRF?: boolean;
  /**
   * Set the JWT token in the Authorization header
   * @default true
   */
  useJWT?: boolean;
}

export type HttpClientConfig = AxiosRequestConfigBase<ExtraAxiosConfig<HttpClientConfig> & HttpClientExtraConfig>;

export const defaultConfig: HttpClientConfig = {
  ...defaultExtraConfig,
  baseURL: api.baseURL,
  withCredentials: true,
  useCSRF: true,
  useJWT: true,
  rejectRequest: (config) => {
    if (!hasCSRFToken(config)) {
      return {
        response: {
          status: 401,
          message: "Missing CSRF token.",
        },
        config,
      };
    }

    return false;
  },
  onError: (error) => {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      const url = new URL("/auth/login", window.location.origin);
      // const query = new URLSearchParams({
      //   callbackUrl: window.location.href,
      // });
      // url.search = query.toString();
      window.location.assign(url.toString());
    }

    throw error;
  },
  retry: 0,
};

const axiosInstance = createAxiosInstance<Partial<HttpClientConfig>>(defaultConfig);

addRejectRequestInterceptor(axiosInstance);
addJwtInterceptor(axiosInstance);
addCsrfInterceptor(axiosInstance);
addDelayInterceptor(axiosInstance);
addRetryInterceptor(axiosInstance);
addErrorInterceptor(axiosInstance);


export default axiosInstance;


// Interceptors

/**
 * Add a request interceptor set the CSRF token in the CSRF header
 * @param axiosInstance Must have the following properties in the config:
 * - `useCSRF`: `boolean`
 */
export function addCsrfInterceptor(axiosInstance: any) {
  const instance = axiosInstance as AxiosInstanceBase<Pick<HttpClientExtraConfig, "useCSRF">>;
  instance.interceptors.request.use((config) => {
    return config.withCredentials ? useCSRFHeader(config) : config;
  }, undefined, { synchronous: true, runWhen: (config) => !!config.useCSRF }); 
}

/**
 * Add a request interceptor set the JWT token in the Authorization header
 * @param axiosInstance Must have the following properties in the config:
 * - `useJWT`: `boolean`
 */
export function addJwtInterceptor(axiosInstance: any) {
  const instance = axiosInstance as AxiosInstanceBase<Pick<HttpClientExtraConfig, "useJWT">>;
  instance.interceptors.request.use(async (config) => {
    const conf =  config.withCredentials ? await setJwtAuthorizationHeader(config) : config;
    return conf;
  }, undefined, { runWhen: (config) => !!config.useJWT });
}


// Utility

export const csrfTokenName = process.env.NEXT_PUBLIC_CSRF_TOKEN_NAME!;

export const csrfHeaderName = process.env.NEXT_PUBLIC_CSRF_HEADER_NAME!;

export function useCSRFHeader<TExtraConfig>(config?: InternalAxiosRequestConfig<TExtraConfig>): InternalAxiosRequestConfig<TExtraConfig> {
  let conf = config as any;
  
  if (!conf) 
    conf = {};
  
  const csrfToken = Cookies.get(csrfTokenName);

  if (csrfToken) {
    if (!conf.headers) 
      conf.headers = {};
    conf.headers[csrfHeaderName] = csrfToken;
  }
  
  conf.withCredentials = true;

  return conf as InternalAxiosRequestConfig<TExtraConfig>;
}

export function hasCSRFToken<TExtraConfig>(config: InternalAxiosRequestConfig<TExtraConfig>) {
  return config?.headers && config.headers[csrfHeaderName];
}

export async function setJwtAuthorizationHeader<TExtraConfig>(config?: InternalAxiosRequestConfig<TExtraConfig>): Promise<InternalAxiosRequestConfig<TExtraConfig>> {
  let conf = config as any;
  
  if (!conf) 
    conf = {};

  if (!jwt.useJwt) return conf;
  
  const accessToken = await jwt.getOrRefreshAccessToken(
    (refresh) => refreshToken(refresh ?? undefined, { 
      useJWT: false, rejectRequest: false, onError: false, signal: config?.signal 
    })
  );

  if (accessToken && jwt.storageType !== "cookie") {
    if (!conf.headers) 
      conf.headers = {};
    conf.headers["Authorization"] = `Bearer ${accessToken}`;
  }

  return conf as InternalAxiosRequestConfig<TExtraConfig>;
}

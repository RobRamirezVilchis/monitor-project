import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

import api from "./api";
import { getOrRefreshAccessToken, jwtCookie, useJwt } from "./auth/auth.utils";

const csrfTokenName = "csrftoken_django";

const customAxiosConfig: AxiosRequestConfig<any> = {
  baseURL: api.baseURL,
};

/**
 * Base instance that includes the base url of the api, 
 * the csrf_token and withCredentials set to true
 */
export const axiosBase = axios.create(customAxiosConfig);

axiosBase.interceptors.request.use(async (config) => {
  return setCSRFTokenHeader(config);
});

/**
 * Same as axios Base but throws a 401 error code if no csrf_token exist
 */
export const axiosError = axios.create(customAxiosConfig);

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
export const axiosRedirectOnError = axios.create(customAxiosConfig);

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
  (response) => {
    return response;
  },
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

    return Promise.reject(error);
  }
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

  return conf as InternalAxiosRequestConfig<any>;
}

function hasCSRFToken(config: InternalAxiosRequestConfig<any>) {
  return config?.headers && config.headers["X-CSRFToken"];
}

async function setJwtAuthorizationHeader(config?: InternalAxiosRequestConfig<any>): Promise<InternalAxiosRequestConfig<any>> {
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

  return conf as InternalAxiosRequestConfig<any>;
}
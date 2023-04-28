import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import Router from "next/router";

import api from "./api";

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
  const newConfig = setCSRFTokenHeader(config);

  if (!hasCSRFToken(newConfig)) {
    return Promise.reject({
      response: {
        status: 401,
        statusText: "Unauthorized",
      },
    });
  }

  return newConfig;
});

/**
 * Same as axiosError but redirects the client to the login page on authentication/authorization 
 * errors, including the one thrown by not having the csrf_token
 */
export const axiosRedirectOnError = axios.create(customAxiosConfig);

axiosRedirectOnError.interceptors.request.use(async (config) => {
  const newConfig = setCSRFTokenHeader(config);

  if (!hasCSRFToken(newConfig)) {
    Router.push({
      pathname: "/auth/login",
      query: {
        callbackUrl: document.URL
      }
    });
    return Promise.reject({
      response: {
        status: 401,
        statusText: "Unauthorized",
      },
    });
  }

  return newConfig;
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
      Router.push({
        pathname: "/auth/login",
        query: {
          callbackUrl: document.URL
        }
      });
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

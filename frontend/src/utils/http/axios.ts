import axios from "axios";

import type { AxiosInstance as AxiosInstanceBase, AxiosRequestConfig as AxiosRequestConfigBase, InternalAxiosRequestConfig } from "./axios.types";
import { sleep } from "@/utils/utils";

export function createAxiosInstance<TExtraConfig = unknown>(config?: AxiosRequestConfigBase<TExtraConfig>) {
  return (axios.create(config) as unknown) as AxiosInstanceBase<TExtraConfig>;
}

export interface ExtraAxiosConfig<TExtraConfig = unknown> {
  /**
   * Whether to reject the request or not
   * @default false
   */
  rejectRequest: false | ((config: InternalAxiosRequestConfig<ExtraAxiosConfig & TExtraConfig>) => 
      { response: any, config: InternalAxiosRequestConfig<ExtraAxiosConfig & TExtraConfig> } | false);
  /**
   * Callback to be called on error. 
   * 
   * NOTE: If the retry interceptor is also used, the callback will be called only once after the last retry if
   * the retry interceptor is set before the error interceptor, otherwise the onError callback will be called on each retry.
   * - If `false`, throws the error as usual
   * - If `((error: any) => any)` is used, the user must manually throw the error, otherwise it will not propagate and the request will be considered successful
   * @default false
   */
  onError: false | ((error: any) => any);
  /**
   * @internal Used internally to keep track of the number of failed attempts
   * @readonly
   * @default 0
   */
  _failureCount: number;
  /**
   * Delay in milliseconds before sending the request
   * @default 0
   */
  delay: number;
  /**
   * Whether to retry the request on error
   * - If `true`, the request will be retried indefinitely
   * - If `false`, the request will not be retried
   * - If a `number` is given, the request will be retried `number` times
   * - If a callback `(failureCount: number, error: any) => boolean`, the request will be retried if the callback returns a truthy value
   * @default 3
   */
  retry: boolean | number | ((failureCount: number, error: any) => boolean);
  /**
   * Delay in milliseconds before retrying the request
   * - If a `number` is given, the delay will be the same for every retry
   * - If a callback `(attemptIndex: number) => number`, the delay will be calculated based on the attempt index
   * @default (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
   */
  retryDelay: number | ((attemptIndex: number) => number);
   /**
   * Callback to be called on error before each retry
   * - `false` to not call a callback
   * - `(failureCount: number, error: any) => void` to set a callback to be called on each retry, throwing the error will cancel the current and any subsequent retries
   * @default false
   */
  onRetry: false | ((failureCount: number, error: any) => void);
  /**
   * @internal Used internally to keep track of the number of failed attempts when retrying the request
   * @readonly
   */
  _retryFailureCount: number;
}

export const defaultExtraConfig: AxiosRequestConfigBase<ExtraAxiosConfig> = {
  rejectRequest: false,
  onError: false,
  _failureCount: 0,
  delay: 0,
  retry: 3,
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  onRetry: false,
  _retryFailureCount: 0,
};

/**
 * Add a request interceptor to reject the request if the `rejectRequest` property in the config returns a truthy value.
 * @param axiosInstance Must have the following properties in the config:
 * - `rejectRequest`: `(false | ((config: InternalAxiosRequestConfig<ExtraAxiosConfig & TExtraConfig>) => { response: any, config: InternalAxiosRequestConfig<ExtraAxiosConfig & TExtraConfig> } | false))`
 */
export function addRejectRequestInterceptor(axiosInstance: any) {
  const instance = axiosInstance as AxiosInstanceBase<Pick<ExtraAxiosConfig, "rejectRequest">>;
  
  instance.interceptors.request.use(async (config) => {
    const reject = config?.rejectRequest && config?.rejectRequest(config as any);
    if (reject) throw reject;
    return config;
  });
}

/**
 * Add a request interceptor to delay the request if the `delay` property in the config is greater than 0.
 * @param axiosInstance Must have the following properties in the config:
 * - `delay`: `number`
 */
export function addDelayInterceptor(axiosInstance: any) {
  const instance = axiosInstance as AxiosInstanceBase<Pick<ExtraAxiosConfig, "delay">>;
  
  instance.interceptors.request.use(async (config) => {
    if (config?.delay && config.delay > 0)
      await sleep(config.delay);
  
    return config;
  }, undefined, { runWhen: (config) => !!config.delay });
}

/**
 * Add a response interceptor to retry the request on error
 * @param axiosInstance Must have the following properties in the config:
 * - `retry`: `boolean | number | ((failureCount: number, error: any) => boolean)`
 * - `retryDelay`: `number | ((attemptIndex: number) => number)`
 * - `onRetry`: `(false | ((failureCount: number, error: any) => void))`
 * 
 * `retry` values:
 * - `true` to retry the request on error indefinitely
 * - `false` to not retry the request on error
 * - `number` to retry the request on error `number` times
 * - `(failureCount: number, error: any) => boolean` to retry the request on error if the callback returns a truthy value
 * 
 * `retryDelay` values:
 * - `number` to set the same delay for every retry
 * - `(attemptIndex: number) => number` to set the delay based on the attempt index
 * 
 * `onRetry` values:
 * - `false` to not call a callback
 * - `(failureCount: number, error: any) => void` to set a callback to be called on each retry
 */
export function addRetryInterceptor(axiosInstance: any) {
  const instance = axiosInstance as AxiosInstanceBase<Pick<ExtraAxiosConfig, "retry" | "retryDelay" | "onRetry" | "_retryFailureCount">>;
  
  instance.interceptors.response.use(undefined, async (error) => {
    const config = error.config as Pick<ExtraAxiosConfig, "retry" | "retryDelay" | "onRetry" | "_retryFailureCount">;
    
    config._retryFailureCount = (config._retryFailureCount || 0) + 1;

    if (config.retry === true 
      || (typeof config.retry === "function" && config.retry(error.config._retryFailureCount, error))
      || (typeof config.retry === "number" && config._retryFailureCount <= config.retry)) {
     
      const retryDelay = typeof config.retryDelay === "function" 
        ? config.retryDelay(config._retryFailureCount) 
        : config.retryDelay;

      if (config?.onRetry) config?.onRetry(config._retryFailureCount, error);
        
      if (retryDelay > 0) await sleep(retryDelay);

      return axiosInstance(error.config);
    }

    throw error;
  });
}

/**
 * Add a response interceptor to set a callback to be called on error
 * @param axiosInstance Must have the following properties in the config:
 * - `onError`: `(false | ((error: any) => any))`
 * - `_failureCount`: `number`
 * 
 * `onError` values:
 *  - `false` to throw the error as usual
 *  - `((error: any) => any)` to set a callback on error (the error must be manually thrown here if it needs to be handled by the user as usual)
 */
export function addErrorInterceptor(axiosInstance: any) {
  const instance = axiosInstance as AxiosInstanceBase<Pick<ExtraAxiosConfig, "onError" | "_failureCount">>;
  
  instance.interceptors.response.use(undefined, (error) => {
    const config = error.config as Pick<ExtraAxiosConfig, "onError" | "_failureCount">;

    config._failureCount = (config._failureCount || 0) + 1;

    if (config?.onError && (config._failureCount >= ((config as any)._retryFailureCount || 0)))
      return config?.onError(error);
  
    throw error;
  });
}

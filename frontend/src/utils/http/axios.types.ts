import type { 
  AxiosRequestConfig as AxiosRequestConfigBase, 
  InternalAxiosRequestConfig as InternalAxiosRequestConfigBase, 
  AxiosResponse,
  AxiosDefaults,
  HeadersDefaults,
  AxiosHeaderValue,
} from "axios";

export type AxiosRequestConfig<Extras = {}, D = any> = {}
  & AxiosRequestConfigBase<D> & Extras;

export type InternalAxiosRequestConfig<Extras = {}, D = any> = {} 
  & InternalAxiosRequestConfigBase<D> & Extras;

export type AxiosInterceptorOptions<Extras = {}> = {
  synchronous?: boolean;
  runWhen?: (config: InternalAxiosRequestConfig<Extras>) => boolean;
}

export type AxiosInterceptorManager<V, Extras = {}> = {
  use: (
    onFulfilled?: ((value: V) => V | Promise<V>) | null, 
    onRejected?: ((error: any) => any) | null, 
    options?: AxiosInterceptorOptions<Extras>
  ) => number;
  eject: (id: number) => void;
  clear: () => void;
}

export type AxiosInstance<Extras = {}> = {
  interceptors: {
    request: AxiosInterceptorManager<InternalAxiosRequestConfig<Extras>, Extras>;
    response: AxiosInterceptorManager<AxiosResponse, Extras>;
  };
  <T = any, R = AxiosResponse<T>, D = any>(config: AxiosRequestConfig<Extras, D>): Promise<R>;
  <T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<Extras, D>): Promise<R>;
  defaults: Omit<AxiosDefaults, 'headers'> & {
    headers: HeadersDefaults & {
      [key: string]: AxiosHeaderValue
    };
  } & Extras;
  getUri: (config?: AxiosRequestConfig<Extras>) => string;
  request: <T = any, R = AxiosResponse<T>, D = any>(config: AxiosRequestConfig<Extras, D>) => Promise<R>;
  get: <T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<Extras, D>) => Promise<R>;
  delete: <T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<Extras, D>) => Promise<R>;
  head: <T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<Extras, D>) => Promise<R>;
  options: <T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<Extras, D>) => Promise<R>;
  post: <T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<Extras, D>) => Promise<R>;
  put: <T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<Extras, D>) => Promise<R>;
  patch: <T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<Extras, D>) => Promise<R>;
  postForm: <T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<Extras, D>) => Promise<R>;
  putForm: <T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<Extras, D>) => Promise<R>;
  patchForm: <T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<Extras, D>) => Promise<R>;
}
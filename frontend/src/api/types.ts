export interface ApiErrorDetail {
  code: string;
  detail: string;
  attr: string | null;
}

export interface ApiError {
  type: "validation_error" | "client_error" | "server_error";
  errors: ApiErrorDetail[];
}

export type Id = string | number;

export type Paginated<T> = {
  data: T[];
  pagination?: {
    page: number;
    page_size: number;
    count: number;
    pages: number;
  }
}

export type OptionallyPaginated<T> = Paginated<T> | T[];

export const isPaginated = <T>(obj: OptionallyPaginated<T>): obj is Paginated<T> => {
  return !Array.isArray(obj) && !!obj.pagination && !!obj.data;
}

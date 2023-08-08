export interface ApiErrorDetail {
  code: string;
  detail: string;
  field: string | null;
}

export interface ApiError {
  type: "validation_error" | "client_error" | "server_error";
  errors: ApiErrorDetail[];
}

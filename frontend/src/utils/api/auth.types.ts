import { providers } from "./auth";

export interface User {
  id?: number;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
  permissions: string[];
}

export type Providers = typeof providers;

export type ProviderKey = keyof Providers;

export type Provider = Providers[ProviderKey];

export enum AuthError {
  IncorrectCredentials,
  EmailNotVerified,
  UsernameAlreadyRegistered,
  EmailAlreadyRegistered,
  ProviderNotFound,
}

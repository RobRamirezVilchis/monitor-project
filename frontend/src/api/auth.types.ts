import { providers } from "./auth";

export const userRoles = [
  "Admin",
  "User",
] as const;

export type Role =  typeof userRoles[number];

export interface User {
  id?: number;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
  permissions: string[];
  extra?: {
    picture?: string;
  };
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
  ServerError,
}

import { providers } from "./auth.utils";

export enum Role {
  Admin = "Administrator",
  User = "User",
  None = "None",
}

export interface User {
  id?: number;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
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

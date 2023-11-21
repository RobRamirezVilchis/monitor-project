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

export interface BasicLoginInfo {
  key: string;
}

export interface JWTLoginInfo {
  user: User;
  access_token: string;
  refresh_token: string; // In secure contexts, this will be an empty string
  access_token_expiration: string;
  refresh_token_expiration: string;
}

export type LoginInfo = BasicLoginInfo | JWTLoginInfo;

export interface UpdateUserData {
  username?: string,
  first_name?: string,
  last_name?: string,
}

export interface RegisterUserData {
  username: string;
  email: string;
  password1: string;
  password2: string;
  first_name: string;
  last_name: string;
}

export interface LoginUserData {
  username?: string;
  email?: string;
  password: string;
}

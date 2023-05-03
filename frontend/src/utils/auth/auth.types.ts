import { providers } from "./auth.utils";

export enum Role {
  Admin = "Administrator",
  User = "User",
  None = "None",
}

export interface User {
  id: number;
  username: string;
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

export const getAuthErrorString = (error: AuthError) => {
  switch(error) {
    case AuthError.IncorrectCredentials:
      return "El usuario o la contraseña son incorrectos.";
    case AuthError.EmailNotVerified:
      return "El email ingresado no ha sido verificado.";
    case AuthError.UsernameAlreadyRegistered:
      return "El usuario ya se encuentra registrado.";
    case AuthError.ProviderNotFound:
      return "Error en el proveedor seleccionado.";
    default:
      return "Error en la aplicación.";
  }
}
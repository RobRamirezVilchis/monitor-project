import { AxiosResponse } from "axios";
import { parseISO } from "date-fns";
import http, { AxiosRequestConfig } from "../http";

import api from "../api";
import { AuthError, User } from "./auth.types";
import logger from "../logger";

export const emailPattern = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

/**
 * @returns True if the user role is in the rolesWhitelist and NOT in the rolesBlacklist
 * or if both lists are undefined. False otherwise or if the user is null or undefined.
 */
export function isUserInAuthorizedRoles(
  user?: User | null, rolesWhitelist?: string[], rolesBlacklist?: string[], permissionsRequired?: string[]
) {
  if (!user) 
    return false;

  const whitelisted = !rolesWhitelist || rolesWhitelist.some(x => user.roles.includes(x));
  const blacklisted = rolesBlacklist && rolesBlacklist.some(x => user.roles.includes(x));
  const permissions = !permissionsRequired || permissionsRequired.every(x => user.permissions.includes(x));
  const authorized = whitelisted && !blacklisted && permissions;
  return authorized;
}

export const fetchMyUser = async (config?: AxiosRequestConfig): Promise<AxiosResponse<User, any>> => {
  return http.get<User>(api.endpoints.auth.user, config);
}

export const getMyUser = async (config?: AxiosRequestConfig): Promise<User | null> => {
  try {
    const resp = await fetchMyUser(config);
    if (resp.status === 200)
      return resp.data;
  }
  catch (e) {
    logger.debug("Failed to fetch user profile.", e);
  }

  return null;
}

export const updateMyInfo = (
  data: {
    username?: string,
    first_name?: string,
    last_name?: string,
  },
  config?: AxiosRequestConfig
) => {
  return http.patch<User>(api.endpoints.auth.user, data, config);
};

export const deleteMyAccount = (config?: AxiosRequestConfig) => {
  return http.delete(api.endpoints.auth.user, config);
};

export interface RegisterUserData {
  username: string;
  email: string;
  password1: string;
  password2: string;
  first_name: string;
  last_name: string;
}

export const registerUser = (data: RegisterUserData, config?: AxiosRequestConfig) => {
  return http.post(api.endpoints.auth.register, data, config);
};

export const isRegisterTokenValid = async (key: string, config?: AxiosRequestConfig) => {
  try {
    const resp = await http.get(api.endpoints.auth.registerTokenValidity, { ...config, params: { key } });
    return true;
  }
  catch (e) { }
  return false;
};

export const verifyAccount = (key: string, config?: AxiosRequestConfig) => {
  return http.post(api.endpoints.auth.registerVerifyEmail, { key }, config);
};

export const resendActivationEmail = (email: string, config?: AxiosRequestConfig) => {
  return http.post(api.endpoints.auth.registerResendEmail, { email }, config);
};

export const getConnectedSocialAccounts = async (config?: AxiosRequestConfig) => {
  try {
    const resp = await http.get(api.endpoints.auth.connectedSocialAccounts, config);
    return resp.data;
  }
  catch (e) {
    return [];
  }
};

export const disconnectSocialAccount = (socialAccountId: number, config?: AxiosRequestConfig) => {
  return http.post(api.endpoints.auth.disconnectSocialAccount(socialAccountId), undefined, config);
}

export const requestPasswordReset = (email: string, config?: AxiosRequestConfig) => {
  return http.post(api.endpoints.auth.passwordResetRequest, { email }, config);
};

export const confirmPasswordReset = (
  uid: string,
  token: string,
  newPassword1: string,
  newPassword2: string,
  config?: AxiosRequestConfig
) => {
  return http.post(api.endpoints.auth.passwordResetConfirm, 
    { uid, token, new_password1: newPassword1, new_password2: newPassword2 },
    config
  );
};

export const isPasswordResetTokenValid = async (uid: string, token: string, config?: AxiosRequestConfig) => {
  try {
    const resp = await http.get(api.endpoints.auth.passwordResetValidity, { ...config, params: { uid, token } });
    return true;
  }
  catch (e) { }
  return false;
};

export const changePassword = (newPassword1: string, newPassword2: string, config?: AxiosRequestConfig) => {
  return http.post(api.endpoints.auth.passwordChange, 
    { new_password1: newPassword1, new_password2: newPassword2 },
    config
  );
};

export const getAuthErrorString = (error: AuthError) => {
  switch(error) {
    case AuthError.IncorrectCredentials:
      return "El usuario o la contraseña son incorrectos.";
    case AuthError.EmailNotVerified:
      return "El email ingresado no ha sido verificado.";
    case AuthError.UsernameAlreadyRegistered:
      return "El usuario ya se encuentra registrado.";
    case AuthError.EmailAlreadyRegistered:
      return "El e-mail ya se encuentra registrado.";
    case AuthError.ProviderNotFound:
      return "Error en el proveedor seleccionado.";
    default:
      return "Error en la aplicación.";
  }
}

export const providers = {
  google: {
    id: "google",
    name: "Google",
  }
};

// JWT

export const useJwt = process.env.NEXT_PUBLIC_USE_JWT_AUTH?.toLocaleLowerCase() === "true" ?? false;
export const jwtStorage = process.env.NEXT_PUBLIC_JWT_STORAGE?.toLocaleLowerCase() ?? "local";
export const jwtCookie = process.env.NEXT_PUBLIC_JWT_STORAGE?.toLocaleLowerCase() === "cookie";
export const jwtCookieAccessTokenName = process.env.NEXT_PUBLIC_JWT_COOKIE_ACCESS_TOKEN_NAME ?? "auth";
export const jwtCookieRefreshTokenName = process.env.NEXT_PUBLIC_JWT_REFRESH_TOKEN_NAME ?? "refresh";
export const jwtCookieHttpOnly = process.env.NEXT_PUBLIC_JWT_HTTPONLY?.toLocaleLowerCase() === "true" ?? false;

const cookieStorage: Pick<Storage, "getItem" | "setItem" | "removeItem"> = {
  getItem: (key: string) => null,
  setItem: (key: string, value: string) => { },
  removeItem: (key: string) => { },
}

let storage = cookieStorage;
let expStorage = cookieStorage;
if (typeof window !== "undefined") {
  if (jwtStorage === "cookie") {
    storage = cookieStorage;
    expStorage = localStorage;
  }
  else if (jwtStorage === "session") {
    storage = sessionStorage;
    expStorage = sessionStorage;
  }
  else {
    storage = localStorage;
    expStorage = localStorage;
  }
}

export function getAccessToken() {
  return storage.getItem("auth");
}

export function getRefreshToken() {
  return storage.getItem("refresh");
}

export function setAccessToken(token: string) {
  storage.setItem("auth", token);
}

export function setRefreshToken(token: string) {
  storage.setItem("refresh", token);
}

export function getAccessTokenExpiration() {
  return expStorage.getItem("auth_exp");
}

export function getRefreshTokenExpiration() {
  return expStorage.getItem("refresh_exp");
}

export function setAccessTokenExpiration(exp: string) {
  expStorage.setItem("auth_exp", exp);
}

export function setRefreshTokenExpiration(exp: string) {
  expStorage.setItem("refresh_exp", exp);
}

export function isAccessTokenExpired() {
  const exp = getAccessTokenExpiration();
  if (!exp) return true;
  return Date.now() >= parseISO(exp).getDate();
}

export function isRefreshTokenExpired() {
  const exp = getRefreshTokenExpiration();
  if (!exp) return true;
  return Date.now() >= parseISO(exp).getDate();
}

export async function refreshAccessToken() {
  try {
    const resp = await http.post(
      api.endpoints.auth.tokenRefresh, 
      jwtCookie ? undefined : { refresh: getRefreshToken() },
      { rejectRequest: undefined, onError: undefined }
    );
    setAccessToken(resp.data.access);
    setAccessTokenExpiration(resp.data.access_token_expiration);
    return resp.data.access;
  }
  catch (e) {
    logger.log("Failed to refresh access token.", e);
  }
  return null;
}

export function getOrRefreshAccessToken() {
  if (isAccessTokenExpired()) {
    return refreshAccessToken();
  }
  return getAccessToken();
}

export function clearJwtStorage() {
  storage.removeItem("auth");
  storage.removeItem("auth_exp");
  expStorage.removeItem("refresh");
  expStorage.removeItem("refresh_exp");
}
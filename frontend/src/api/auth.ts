import { AxiosResponse } from "axios";
import { parseISO } from "date-fns";

import api from ".";
import http from "@/api/http";
import { AuthError, LoginInfo, LoginUserData, RegisterUserData, UpdateUserData, User } from "./auth.types";
import logger from "@/utils/logger";

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

export async function getMyUser(
  config?: Parameters<typeof http.get>[1]
) {
  try {
    const { data } = await http.get<User | null>(
      api.endpoints.auth.user, 
      config
    );
    return data;
  }
  catch (error) {
    throw error;
  }
}

export async function updateMyInfo(
  data: UpdateUserData,
  config?: Parameters<typeof http.patch>[2]
) {
  try {
    const resp = await http.patch<User>(
      api.endpoints.auth.user, 
      data, 
      config
    );
    return resp.data;
  }
  catch (error) {
    throw error;
  } 
};

export async function deleteMyAccount(
  config?: Parameters<typeof http.delete>[1]
) {
  try {
    const { data } = await http.delete(
      api.endpoints.auth.user, 
      config
    );
    return data;
  }
  catch (error) {
    throw error;
  }
};

export async function registerUser(
  data: RegisterUserData, 
  config?: Parameters<typeof http.post>[2]
) {
  try {
    const resp = await http.post(
      api.endpoints.auth.register, 
      data, 
      config
    );
    return resp.data;
  }
  catch (error) {
    throw error;
  }
};

export async function login(
  data: LoginUserData,
  config?: Parameters<typeof http.post>[2]
) {
  try {
    const resp = await http.post<LoginInfo>(
      api.endpoints.auth.login, 
      data, 
      config
    );
    return resp.data;
  }
  catch (error) {
    throw error;
  }
};

export async function unsafeSocialLogin(
  url: string,
  data: any,
  config?: Parameters<typeof http.post>[2]
) {
  try {
    const resp = await http.post<LoginInfo>(
      url, 
      data,
      config
    );
    return resp.data;
  }
  catch (error) {
    throw error;
  }
}

export async function logout(
  config?: Parameters<typeof http.post>[2]
) {
  try {
    const resp = await http.post(
      api.endpoints.auth.logout, 
      undefined, 
      config
    );
    return resp.data;
  }
  catch (error) {
    throw error;
  }
}

export async function isRegisterTokenValid(
  key: string, 
  config?: Parameters<typeof http.get>[1]
) {
  try {
    await http.get(api.endpoints.auth.registerTokenValidity, { ...config, params: { key } });
    return true;
  }
  catch (e) { }
  return false;
};

export async function verifyAccount(
  key: string, 
  config?: Parameters<typeof http.post>[2]
) {
  try {
    const resp = await http.post(
      api.endpoints.auth.registerVerifyEmail, 
      { key }, 
      config
    );
    return resp.data;
  }
  catch (error) {
    throw error;
  }
};

export async function resendActivationEmail(
  email: string, 
  config?: Parameters<typeof http.post>[2]
) {
  try {
    const { data } = await http.post(
      api.endpoints.auth.registerResendEmail, 
      { email }, 
      config
    );
    return data;
  }
  catch (error) {
    throw error;
  }
};

export async function getConnectedSocialAccounts(
  config?: Parameters<typeof http.get>[1]
) {
  try {
    const resp = await http.get(
      api.endpoints.auth.connectedSocialAccounts, 
      config
    );
    return resp.data;
  }
  catch (error) {
    throw error;
  }
};

export async function disconnectSocialAccount(
  socialAccountId: number, 
  config?: Parameters<typeof http.post>[2]
) {
  try {
    http.post(api.endpoints.auth.disconnectSocialAccount(socialAccountId), undefined, config);
    const resp = await http.post(
      api.endpoints.auth.disconnectSocialAccount(socialAccountId), 
      undefined, 
      config
    );
    return resp.data;
  }
  catch (error) {
    throw error;
  }
}

export async function requestPasswordReset(
  email: string, 
  config?: Parameters<typeof http.post>[2]
) {
  try {
    const { data } = await http.post(
      api.endpoints.auth.passwordResetRequest, 
      { email }, 
      config
    );
    return data;
  }
  catch (error) {
    throw error;
  }
};

export async function confirmPasswordReset(
  uid: string,
  token: string,
  newPassword1: string,
  newPassword2: string,
  config?: Parameters<typeof http.post>[2]
) {
  try {
    const resp = await http.post(
      api.endpoints.auth.passwordResetConfirm, 
      { uid, token, new_password1: newPassword1, new_password2: newPassword2 }, 
      config
    );
    return resp.data;
  }
  catch (error) {
    throw error;
  }
};

export async function isPasswordResetTokenValid(
  uid: string, 
  token: string, 
  config?: Parameters<typeof http.get>[1]
) {
  try {
    await http.get(
      api.endpoints.auth.passwordResetValidity, 
      { 
        ...config, 
        params: { uid, token },
      }
    );
    return true;
  }
  catch (e) { }
  return false;
};

export async function changePassword(
  newPassword1: string, 
  newPassword2: string, 
  config?: Parameters<typeof http.post>[2]
) {
  try {
    const resp = await http.post(
      api.endpoints.auth.passwordChange, 
      { new_password1: newPassword1, new_password2: newPassword2 },
      config
    );
    return resp.data;
  }
  catch (error) {
    throw error;
  }
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
      { setJwtToken: false, rejectRequest: false, onError: false }
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
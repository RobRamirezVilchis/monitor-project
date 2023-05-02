import { AxiosInstance, AxiosResponse } from "axios";
import Router from "next/router";

import api from "../api";
import { AuthError, Role, User } from "./auth.types";
import logger from "../logger";

export const emailPattern = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

/**
 * @returns True if the user role is in the rolesWhitelist and NOT in the rolesBlacklist
 * or if both lists are undefined. False otherwise or if the user is null or undefined.
 */
export function isUserInAuthorizedRoles(
  user?: User | null, rolesWhitelist?: Role[], rolesBlacklist?: Role[]
) {
  if (!user) 
    return false;

  const whitelisted = !rolesWhitelist || rolesWhitelist.includes(user.role);
  const blacklisted = rolesBlacklist && rolesBlacklist.includes(user.role);
  const authorized = whitelisted && !blacklisted;
  return authorized;
}

export const fetchMyUser = async (
  http: AxiosInstance, 
  abortSignal?: AbortSignal
): Promise<AxiosResponse<User, any>> => {
  return http.get<User>(api.endpoints.auth.user, {
    signal: abortSignal,
  });
}

export const getMyUser = async (
  http: AxiosInstance, 
  abortSignal?: AbortSignal
): Promise<User | null> => {
  try {
    const resp = await fetchMyUser(http, abortSignal);
    if (resp.status === 200)
      return resp.data;
  }
  catch (e) {
    logger.debug("Failed to fetch user profile.", e);
  }

  return null;
}

export const updateMyInfo = (
  http: AxiosInstance,
  data: {
    username?: string,
    first_name?: string,
    last_name?: string,
  },
  abortSignal?: AbortSignal
) => {
  return http.patch<User>(api.endpoints.auth.user, data, { signal: abortSignal });
};

export const deleteMyAccount = (
  http: AxiosInstance,
  abortSignal?: AbortSignal
) => {
  return http.delete(api.endpoints.auth.user, { signal: abortSignal });
};

export interface RegisterUserData {
  username: string;
  email: string;
  password1: string;
  password2: string;
  first_name: string;
  last_name: string;
}

export const registerUser = ( 
  http: AxiosInstance,
  data: RegisterUserData,
  abortSignal?: AbortSignal
) => {
  return http.post(api.endpoints.auth.register, data, { signal: abortSignal });
};

export const isRegisterTokenValid = async (
  http: AxiosInstance, 
  key: string,
  abortSignal?: AbortSignal
) => {
  try {
    const resp = await http.get(api.endpoints.auth.registerTokenValidity, { 
      params: { key }, 
      signal: abortSignal
    });
    return true;
  }
  catch (e) { }
  return false;
};

export const verifyAccount = (
  http: AxiosInstance, 
  key: string,
  abortSignal?: AbortSignal
) => {
  return http.post(api.endpoints.auth.registerVerifyEmail, 
    { key }, 
    { signal: abortSignal }
  );
};

export const resendActivationEmail = (
  http: AxiosInstance, 
  email: string,
  abortSignal?: AbortSignal
) => {
  return http.post(api.endpoints.auth.registerResendEmail,
    { email },
    { signal: abortSignal }
  );
};

export const getConnectedSocialAccounts = async (
  http: AxiosInstance, 
  abortSignal?: AbortSignal
) => {
  try {
    const resp = await http.get(api.endpoints.auth.connectedSocialAccounts,
      { signal: abortSignal }
    );
    return resp.data;
  }
  catch (e) {
    return [];
  }
};

export const disconnectSocialAccount = (
  http: AxiosInstance, 
  socialAccountId: number,
  abortSignal?: AbortSignal
) => {
  return http.post(api.endpoints.auth.disconnectSocialAccount(socialAccountId), 
    undefined,
    { signal: abortSignal }
  );
}

export const requestPasswordReset = (
  http: AxiosInstance, 
  email: string,
  abortSignal?: AbortSignal
) => {
  return http.post(api.endpoints.auth.passwordResetRequest, 
    { email },
    { signal: abortSignal }
  );
};

export const confirmPasswordReset = (
  http: AxiosInstance, 
  uid: string,
  token: string,
  newPassword1: string,
  newPassword2: string,
  abortSignal?: AbortSignal
) => {
  return http.post(api.endpoints.auth.passwordResetConfirm, 
    { uid, token, new_password1: newPassword1, new_password2: newPassword2 },
    { signal: abortSignal }
  );
};

export const isPasswordResetTokenValid = async (
  http: AxiosInstance, 
  uid: string,
  token: string,
  abortSignal?: AbortSignal
) => {
  try {
    const resp = await http.get(api.endpoints.auth.passwordResetValidity, { 
      params: { uid, token }, 
      signal: abortSignal
    });
    return true;
  }
  catch (e) { }
  return false;
};

export const changePassword = (
  http: AxiosInstance, 
  newPassword1: string,
  newPassword2: string,
  abortSignal?: AbortSignal
) => {
  return http.post(api.endpoints.auth.passwordChange, 
    { new_password1: newPassword1, new_password2: newPassword2 },
    { signal: abortSignal }
  );
};

export const goToLoginPage = () => {
  Router.push({
    pathname: "/auth/login/", 
    query: { 
      callbackUrl: document.URL 
    },
  });
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

export const getRoleName = (role: Role) => {
  switch(role) {
    case Role.Admin:
      return "Admin";
    case Role.User:
      return "Usuario";
    default:
      return "Sin rol";
  }
}
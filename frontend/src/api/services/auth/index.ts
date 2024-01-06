import { AuthError, LoginInfo, LoginUserData, RefreshTokenResponse, RegisterUserData, UpdateUserData, User, UserAuthorizationPolicies } from "./types";
import { Id } from "@/api/types";
import api from "../..";
import http from "@/api/http";

/**
 * @returns `true` if any of the following conditions is met:
 * - The user is a `superuser`
 * - Any of the user roles in in the `rolesWhitelist` and NOT in the `rolesBlacklist`
 * - If both the `rolesWhitelist` and the `rolesBlacklist` are undefined. 
 * 
 * Always returns `false` if the user is null or undefined.
 */
export function isUserInAuthorizedRoles(user?: User | null, {
  rolesWhitelist,
  rolesBlacklist,
  permissions,
}: UserAuthorizationPolicies = {}) {
  if (!user) 
    return false;

  if (user.superuser) return true;

  const whitelisted = !rolesWhitelist || rolesWhitelist.some(x => user.roles.includes(x));
  const blacklisted = rolesBlacklist && rolesBlacklist.some(x => user.roles.includes(x));
  const hasPermissions = !permissions || (!!user?.permissions && permissions.every(x => user.permissions!.includes(x)));
  const authorized = whitelisted && !blacklisted && hasPermissions;
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
  socialAccountId: Id, 
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

export async function verifyToken(
  token: string, 
  config?: Parameters<typeof http.post>[2]
) {
  try {
    const resp = await http.post(
      api.endpoints.auth.tokenVerify, 
      { token }, 
      config
    );
    return resp.data;
  }
  catch (error) {
    throw error;
  }
}

export async function refreshToken(
  refreshToken?: string, 
  config?: Parameters<typeof http.post>[2]
) {
  const data = refreshToken ? { refresh: refreshToken } : undefined;
  try {
    const resp = await http.post<RefreshTokenResponse>(
      api.endpoints.auth.tokenRefresh, 
      data, 
      config
    );
    return resp.data;
  }
  catch (error) {
    throw error;
  }
}

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

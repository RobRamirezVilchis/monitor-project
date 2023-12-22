import { createMutation } from "../helpers/createMutation";
import { 
  login,
  logout,
  unsafeSocialLogin,
  updateMyInfo,
  verifyAccount,
} from "../services/auth";
import { JWTLoginInfo, LoginUserData } from "../services/auth/types";
import { useMyUserQuery } from "../queries/auth";
import defaultQueryClient from "../clients/defaultQueryClient";
import jwt from "../jwt";

export const useLoginMutation = createMutation({
  mutationKey: ["user-login"],
  mutationFn: (data: LoginUserData) => login(data, { rejectRequest: false, onError: false, useJWT: false, withCredentials: false }),
  onSuccess: (data) => {
    useMyUserQuery.invalidatePrimaryKey();

    if (jwt.useJwt) {
      data = data as JWTLoginInfo;
      jwt.clearStorage();
      if (jwt.storageType !== "cookie") {
        jwt.setAccessToken(data.access_token);
        jwt.setRefreshToken(data.refresh_token);
      }
      jwt.setAccessTokenExpiration(new Date(data.access_token_expiration).toISOString());
      jwt.setRefreshTokenExpiration(new Date(data.refresh_token_expiration).toISOString());
    }
  },
});

export const useLogoutMutation = createMutation({
  mutationKey: ["user-logout"],
  mutationFn: () => logout({ rejectRequest: false, onError: false }),
  onMutate: () => {
    defaultQueryClient.invalidateQueries();
    jwt.clearStorage();
  },
  onSuccess: () => {
    defaultQueryClient.cancelQueries();
    defaultQueryClient.clear();
    useMyUserQuery.invalidatePrimaryKey({
      refetchType: "none",
    });
  },
});

export const useUnsafeSocialLoginMutation = createMutation({
  mutationKey: ["user-social-login"],
  mutationFn: ({ url, data }: { url: string; data: any }) => 
    unsafeSocialLogin(url, data, { rejectRequest: false, onError: false, useJWT: false }),
  onSuccess: (data) => {
    if (jwt.useJwt) {
      data = data as JWTLoginInfo;
      jwt.clearStorage();
      if (jwt.storageType !== "cookie") {
        jwt.setAccessToken(data.access_token);
        jwt.setRefreshToken(data.refresh_token);
      }
      jwt.setAccessTokenExpiration(new Date(data.access_token_expiration).toISOString());
      jwt.setRefreshTokenExpiration(new Date(data.refresh_token_expiration).toISOString());
    }
  }
});

export const useActivateAccountMutation = createMutation({
  mutationKey: ["user-activate-account"],
  mutationFn: ({ key }: { key: string; }) => 
    verifyAccount(key, { rejectRequest: false, onError: false, useJWT: false }),
});

export const useUpdateMyUserMutation = createMutation({
  mutationKey: ["user-update-my-user"],
  mutationFn: updateMyInfo,
  onSuccess: () => {
    useMyUserQuery.invalidatePrimaryKey();
  }
});

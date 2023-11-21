import { createMutation } from "../helpers/createMutation";
import { 
  login,
  clearJwtStorage,
  jwtCookie,
  setAccessToken,
  setAccessTokenExpiration,
  setRefreshToken,
  setRefreshTokenExpiration,
  useJwt,
  logout,
  unsafeSocialLogin,
} from "../auth";
import { JWTLoginInfo, LoginUserData } from "../auth.types";
import { useMyUserQuery } from "../queries/auth";
import defaultQueryClient from "../clients/defaultQueryClient";

export const useLoginMutation = createMutation({
  mutationKey: ["user-login"],
  mutationFn: (data: LoginUserData) => login(data, { rejectRequest: false, onError: false }),
  onSuccess: (data) => {
    useMyUserQuery.invalidatePrimaryKey();

    if (useJwt) {
      data = data as JWTLoginInfo;
      clearJwtStorage();
      if (!jwtCookie) {
        setAccessToken(data.access_token);
        setRefreshToken(data.refresh_token);
      }
      setAccessTokenExpiration(data.access_token_expiration);
      setRefreshTokenExpiration(data.refresh_token_expiration);
    }
  },
});

export const useLogoutMutation = createMutation({
  mutationKey: ["user-logout"],
  mutationFn: () => logout({ rejectRequest: false, onError: false }),
  onMutate: () => {
    defaultQueryClient.invalidateQueries();
    clearJwtStorage();
  },
  onSuccess: () => {
    defaultQueryClient.cancelQueries();
    defaultQueryClient.clear();
    useMyUserQuery.invalidatePrimaryKey({
      refetchType: "none",
    });
  },
});

export const useUnsafeSocialLogin = createMutation({
  mutationKey: ["user-social-login"],
  mutationFn: ({ url, data }: { url: string; data: any }) => 
    unsafeSocialLogin(url, data, { rejectRequest: false, onError: false }),
  onSuccess: (data) => {
    if (useJwt) {
      data = data as JWTLoginInfo;
      clearJwtStorage();
      if (!jwtCookie) {
        setAccessToken(data.access_token);
        setRefreshToken(data.refresh_token);
      }
      setAccessTokenExpiration(data.access_token_expiration);
      setRefreshTokenExpiration(data.refresh_token_expiration);
    }
  }
});

"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  AuthContext,
  RedirectToUrl,
  SocialAction,
  SocialLoginCallbacks,
  getRedirectUrl,
} from "@/components/auth/AuthProvider";
import { isUserInAuthorizedRoles } from "@/api/services/auth";
import { LoginUserData } from "@/api/services/auth/types";
import { ProviderKey, ProvidersOptions } from "@/utils/auth/oauth";

export const useAuth = (options?: {
  /**
   * If true, the AuthProvider will trigger a sign in request
   * If false the AuthProvider may still trigger a sign in request if
   * another useAuth hook with this property set to true is in the render tree
   * @default true
   */
  triggerAuthentication?: boolean;
  /**
   * If true, the hook will not perform any authentication or
   * authorization check and won't redirect the user.
   * @default false
   */
  skipAll?: boolean;
  /**
   * If true, the client will be redirected to the 'redirectTo' route
   * if the user is not authenticated.
   * @default true
   */
  redirectIfNotAuthenticated?: boolean;
  /**
   * Setting this to true will prevent the hook to try to validate if user is authorized
   * and will ignore the values of redirectIfNotAuthorized, rolesWhitelist, rolesBlacklist
   * @default false
   */
  skipAuthorization?: boolean;
  /**
   * If true, the client will be redirected to the value given by the redirectTo option
   * if the user is not authorized.
   * @default true
   */
  redirectIfNotAuthorized?: boolean;
  /**
   * If undefined, all users will be authorized unless their roles are blacklisted.
   * If a list is given, only users in it will be authorized, unless they're also blacklisted.
   */
  rolesWhitelist?: string[];
  /**
   * Users whose role is in this list will not be authorized.
   */
  rolesBlacklist?: string[];
  /**
   * The permissions required to authorize the user. If undefined, the user will be authorized
   * unless they are restricted by the rolesWhitelist or rolesBlacklist options.
   */
  permissionsRequired?: string[];

  /**
   * The route where the client will be redirected if the user is not authenticated and
   * or authorized.
   * @see AuthProvider for default value
   */
  redirectTo?: RedirectToUrl;
  /**
   * Whether to append a callback url param to the redirect url.
   * @see callbackUrlParamName
   * @see AuthProvider for default value
   */
  setCallbackUrlParam?: boolean;
  /**
   * The name of the callback url param to set if setCallbackUrlParam is set to true.
   * @see AuthProvider for default value
   */
  callbackUrlParamName?: string;
}) => {
  const {
    user,
    loading,
    errors,
    dispatchAuth,
    emailLogin,
    socialLogin,
    logout,
    refetchUser,
    lastAction,
    defaultRedirectTo,
    defaultSetCallbackUrlParam,
    defaultCallbackUrlParamName,
  } = useContext(AuthContext);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const registered = useRef(false);
  const router = useRouter();

  useEffect(() => {
    const triggerAuthentication = options?.triggerAuthentication ?? true;
    if (triggerAuthentication && !registered.current) {
      registered.current = true;
      dispatchAuth({ type: "addHook" });
    } else if (!triggerAuthentication && registered.current) {
      registered.current = false;
      dispatchAuth({ type: "removeHook" });
    }
  }, [dispatchAuth, options?.triggerAuthentication]);

  useEffect(() => {
    return () => {
      if (registered.current) {
        registered.current = false;
        dispatchAuth({ type: "removeHook" });
      }
    };
  }, [dispatchAuth]);

  useEffect(() => {
    const opts: typeof options = {
      skipAll: false,
      skipAuthorization: false,
      redirectIfNotAuthenticated: true,
      redirectIfNotAuthorized: true,
      redirectTo: options?.redirectTo ?? defaultRedirectTo,
      setCallbackUrlParam:
        options?.setCallbackUrlParam ?? defaultSetCallbackUrlParam,
      callbackUrlParamName:
        options?.callbackUrlParamName ?? defaultCallbackUrlParamName,
      ...options,
    };

    if (!loading && !opts.skipAll && lastAction !== "logout") {
      if (!user) {
        setIsAuthorized(false);

        if (opts.redirectIfNotAuthenticated && opts.redirectTo) {
          if (opts.setCallbackUrlParam) {
            const url = new URL(
              getRedirectUrl(user, opts.redirectTo),
              window.location.origin
            );
            url.search = new URLSearchParams({
              [opts.callbackUrlParamName!]: window.location.href,
            }).toString();
            router.push(url.toString());
          } else {
            router.push(getRedirectUrl(user, opts.redirectTo).toString());
          }
        }
      } else if (!opts.skipAuthorization) {
        const authorized = isUserInAuthorizedRoles(user, {
          rolesWhitelist: opts.rolesWhitelist,
          rolesBlacklist: opts.rolesBlacklist,
          permissions: opts.permissionsRequired,
        });
        setIsAuthorized(authorized);
        if (!authorized && opts.redirectIfNotAuthorized && opts.redirectTo) {
          if (opts.setCallbackUrlParam) {
            const url = new URL(
              getRedirectUrl(user, opts.redirectTo),
              window.location.origin
            );
            url.search = new URLSearchParams({
              [opts.callbackUrlParamName!]: window.location.href,
            }).toString();

            router.push(url.toString());
          } else {
            router.push(getRedirectUrl(user, opts.redirectTo).toString());
          }
        }
      }
    }
  }, [
    router,
    options,
    loading,
    user,
    defaultRedirectTo,
    defaultSetCallbackUrlParam,
    defaultCallbackUrlParamName,
    lastAction,
  ]);

  /**
   * Login the user using email login or social login (i.e. Google)
   * @param data Data used for the login method. If both types are given, email login will be used
   * @param options Extra options for the login function
   * @returns a Promise<User | null> if emailLogin data was given. If socialLogin data is given,
   * it returns a Promise<void>
   * @throws an error if neither emailLogin or socialLogin data was given
   */
  const login = useCallback(
    async (
      data: {
        emailLogin?: LoginUserData;
        socialLogin?: SocialLoginCallbacks & {
          provider: ProviderKey;
          type?: SocialAction;
          providersOptions?: ProvidersOptions;
        };
      },
      options?: {
        redirect?: boolean;
        redirectTo?: RedirectToUrl;
      }
    ) => {
      dispatchAuth({ type: "clearErrors" });

      if (data.emailLogin) {
        return emailLogin(data.emailLogin, options);
      } else if (data.socialLogin) {
        socialLogin(
          data.socialLogin.provider,
          data.socialLogin.type ?? "login",
          {
            ...options,
            providersOptions: data.socialLogin.providersOptions,
            onPopupClosed: data.socialLogin.onPopupClosed,
            onFinish: data.socialLogin.onFinish,
            onError: data.socialLogin.onError,
          }
        );
      } else {
        throw new Error("At least one type of login data must be provided.");
      }
    },
    [dispatchAuth, emailLogin, socialLogin]
  );

  return {
    user: user,
    isAuthenticated: !!user,
    isAuthorized,
    loading,
    errors,
    login,
    logout: logout,
    refetchUser,
  };
};

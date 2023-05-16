import React, { useCallback, useContext, useEffect, useLayoutEffect, useRef } from "react";
import Router from "next/router";

import { AuthContext, SocialAction } from "./AuthProvider";
import { isUserInAuthorizedRoles } from "../../utils/auth/auth.utils";
import { Role, ProviderKey } from "@/utils/auth/auth.types";

export const useAuth = (options?: {
  /**
   * If true, the AuthProvider will trigger a sign in request
   * If false the AuthProvider may still trigger a sign in request if
   * another useAuth hook with this property set to true is in the render tree
   * @default true
   */
  triggerAuthentication?: boolean,
  /**
   * If true, the hook will not perform any authentication or
   * authorization check and won't redirect the user.
   * @default false
   */
  skipAll?: boolean,
  /**
   * If true, the client will be redirected to the 'redirectTo' route
   * if the user is not authenticated.
   * @default true
   */
  redirectIfNotAuthenticated?: boolean,
  /**
   * Setting this to true will prevent the hook to try to validate if user is authorized
   * and will ignore the values of redirectIfNotAuthorized, rolesWhitelist, rolesBlacklist
   * @default false
   */ 
  skipAuthorization?: boolean,
  /**
   * If true, the client will be redirected to the value given by the redirectTo option
   * if the user is not authorized.
   * @default true
   */
  redirectIfNotAuthorized?: boolean,
  /**
   * If undefined, all users will be authorized unless their roles are blacklisted.
   * If a list is given, only users in it will be authorized, unless they're also blacklisted.
   */
  rolesWhitelist?: Role[],
  /**
   * Users whose role is in this list will not be authorized.
   */
  rolesBlacklist?: Role[],

  /**
   * The route where the client will be redirected if the user is not authenticated and
   * or authorized.
   * @see AuthProvider for default value
   */
  redirectTo?: string,
  /**
   * Whether to append a callback url param to the redirect url.
   * @see callbackUrlParamName
   * @see AuthProvider for default value
   */
  setCallbackUrlParam?: boolean,
  /**
   * The name of the callback url param to set if setCallbackUrlParam is set to true.
   * @see AuthProvider for default value
   */
  callbackUrlParamName?: string,
}) => {
  const {
    authState,
    dispatchAuth,
    emailLogin,
    socialLogin,
    logout,
    changeName,
    forceReconnect,
    defaultRedirectTo,
    defaultSetCallbackUrlParam,
    defaultCallbackUrlParamName,
  } = useContext(AuthContext);
  const [isAuthorized, setIsAuthorized] = React.useState<boolean>(false);
  const registered = useRef(false);

  useLayoutEffect(() => {
    const triggerAuthentication = options?.triggerAuthentication ?? true;
    if (triggerAuthentication && !registered.current) {
      registered.current = true;
      dispatchAuth({ type: "addHook" });
    }
    else if (!triggerAuthentication && registered.current) {
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
    }
  }, [dispatchAuth]);

  useEffect(() => { 
    const opts: typeof options = {
      skipAll: false,
      skipAuthorization: false,
      redirectIfNotAuthenticated: true,
      redirectIfNotAuthorized: true,
      redirectTo: options?.redirectTo ?? defaultRedirectTo,
      setCallbackUrlParam: options?.setCallbackUrlParam ?? defaultSetCallbackUrlParam,
      callbackUrlParamName: options?.callbackUrlParamName ?? defaultCallbackUrlParamName,
      ...options
    };

    if (!authState.loading && !opts.skipAll) {
      if (!authState.user) {
        setIsAuthorized(false);
  
        if (opts.redirectIfNotAuthenticated) {
          if (opts.setCallbackUrlParam) {
            Router.push({
              pathname: opts.redirectTo!,
              query: {
               [opts.callbackUrlParamName!]: document.URL
              }
            });
          }
          else {
            Router.push(opts.redirectTo!);
          }
        }
      }
      else if (!opts.skipAuthorization) {
        const authorized = isUserInAuthorizedRoles(authState.user, opts.rolesWhitelist, opts.rolesBlacklist);
        setIsAuthorized(authorized);
        if (!authorized && opts.redirectIfNotAuthorized) {
          if (opts.setCallbackUrlParam) {
            Router.push({
              pathname: opts.redirectTo!,
              query: {
               [opts.callbackUrlParamName!]: document.URL
              }
            });
          }
          else {
            Router.push(opts.redirectTo!);
          }
        }
      }
    }
  }, [options, authState.loading, authState.user, defaultRedirectTo, defaultSetCallbackUrlParam, defaultCallbackUrlParamName]);

  /**
   * Login the user using email login or social login (i.e. Google)
   * @param data Data used for the login method. If both types are given, email login will be used
   * @param options Extra options for the login function
   * @returns a Promise<User | null> if emailLogin data was given. If socialLogin data is given,
   * it returns a Promise<void>
   * @throws an error if neither emailLogin or socialLogin data was given
   */
  const login = useCallback(async (
    data: {
      emailLogin?: { 
        username?: string, 
        email?: string, 
        password?: string 
      },
      socialLogin?: {
        provider: ProviderKey, 
        type: SocialAction,
      }
    },
    options?: {
      redirect?: boolean,
      redirectTo?: string,
    }
  ) => {
    dispatchAuth({ type: "clearErrors" });

    if (data.emailLogin) {
      return emailLogin(
        data.emailLogin, 
        options
      );
    }
    else if (data.socialLogin) {
      socialLogin(
        data.socialLogin.provider, 
        data.socialLogin.type, 
        options
      );
    }
    else {
      throw new Error("At least one type of login data must be provided.");
    }
  }, [dispatchAuth, emailLogin, socialLogin]);

  return {
    user: authState.user,
    isAuthenticated: authState.user !== null,
    isAuthorized,
    loading: authState.loading,
    errors: authState.errors,
    login,
    logout: logout,
    forceReconnect,
    changeName,
  };
}

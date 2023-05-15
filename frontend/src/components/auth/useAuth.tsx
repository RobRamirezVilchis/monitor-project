import React, { useCallback, useContext, useEffect, useLayoutEffect, useRef } from "react";
import Router from "next/router";

import { AuthContext, SocialAction } from "./AuthProvider";
import { isUserInAuthorizedRoles } from "../../utils/auth/auth.utils";
import { Role, ProviderKey } from "@/utils/auth/auth.types";
import { openCenteredPopupWindow } from "@/utils/window.utils";

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
   * Login the user using basic login (username and password) or social login (i.e. Google)
   * @param data Data used for the login method. If both types are given, socialLogin will
   * be ignored
   * @param options Extra options for the login function
   * @returns a Promise<boolean> if basicLogin data was given. If socialLogin data is given,
   * it returns a Promise based on the documentation found at https://next-auth.js.org/getting-started/client#signin
   * @throws an error if neither basicLogin or socialLogin data was given
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
      return emailLogin(data.emailLogin, options);
    }
    else if (data.socialLogin) {
      startSocialLogin(data.socialLogin.provider, 
        popupData => 
          data.socialLogin 
          && socialLogin(
            data.socialLogin.provider, 
            data.socialLogin.type, 
            popupData, 
            options
          )
      );
    }
    else {
      throw new Error("At least one type of login data must be given");
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

const socialLoginMessageListeners: Array<(event: MessageEvent<any>) => void> = [];

function startSocialLogin(provider: ProviderKey, callback?: (data: any) => void) {
  clearSocialLoginMessageListeners();

  switch (provider) {
    case "google":
      const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      url.searchParams.append("client_id", process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!);
      url.searchParams.append("redirect_uri", process.env.NEXT_PUBLIC_GOOGLE_CALLBACK_URL!);
      url.searchParams.append("response_type", "code");
      url.searchParams.append("scope", "openid profile email");
      url.searchParams.append("prompt", "consent");
      
      const socialLoginWindow = openCenteredPopupWindow(url, window, "oauth", { width: 500, height: 600 });
      
      if (socialLoginWindow) {
        socialLoginWindow.focus();

        const onChildMessage = (event: MessageEvent<any>) => {
          if (event.origin !== window.location.origin) return;
  
          if (event.data.type === "google-callback") {
            callback && callback(event.data.payload);
            clearSocialLoginMessageListeners();
          }
        };
        
        socialLoginMessageListeners.push(onChildMessage);
        window.addEventListener("message", onChildMessage, false);
      }
      break;
  }
}

function clearSocialLoginMessageListeners() {
  let listener = socialLoginMessageListeners.pop();
  while (listener) {
    window.removeEventListener("message", listener);
    listener = socialLoginMessageListeners.pop();
  }
}
"use client";

import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AxiosError, isAxiosError } from "axios";
import { useImmerReducer } from "use-immer";
import { useRouter } from "next/navigation";

import api from "@/utils/api";
import http from "@/utils/http";
import {
  clearJwtStorage,
  fetchMyUser,
  getMyUser,
  jwtCookie,
  setAccessToken,
  setAccessTokenExpiration,
  setRefreshToken,
  setRefreshTokenExpiration,
  updateMyInfo,
  useJwt,
} from "@/utils/auth/auth.utils";
import logger from "@/utils/logger";
import { AuthError, User, ProviderKey } from "@/utils/auth/auth.types";
import { AuthAction, AuthState, authReducer } from "./AuthReducer";
import { ProvidersOptions, startSocialLogin } from "@/utils/auth/oauth";

// Reducer ---------------------------------------------------------------------
const authReducerDefaults: AuthState = {
  user: null,
  loading: true,
  userFetched: false,
  errors: null,
  registeredHooks: 0,
};

// Context ---------------------------------------------------------------------
export interface AuthContextProps {
  authState: AuthState;
  dispatchAuth: React.Dispatch<AuthAction>;
  emailLogin: (loginData: { username?: string, email?: string, password?: string },
    options?: { redirect?: boolean, redirectTo?: string }) => Promise<User | null>;
  socialLogin: (provider: ProviderKey,
    type: SocialAction, 
    options?: { 
      redirect?: boolean;
      redirectTo?: string;
      providersOptions?: ProvidersOptions;
      onPopupClosed?: () => void;
      onFinish?: (user: User | null) => void;
      onError?: (error: any) => void;
    }) => void;
  logout: (options?: { redirect?: boolean, redirectTo?: string }) => void,
  changeName: (data: { first_name?: string, last_name?: string }) => Promise<boolean>;
  forceReconnect: () => void;
  lastAction: "login" | "logout" | null;

  defaultRedirectTo?: string,
  defaultSetCallbackUrlParam?: boolean,
  defaultCallbackUrlParamName?: string,
}

const authContextDefaults: AuthContextProps = {
  authState: authReducerDefaults,
  dispatchAuth: () => {},
  emailLogin: () => Promise.resolve(null),
  socialLogin: () => Promise.resolve(null),
  logout: () => {},
  changeName: () => Promise.resolve(false),
  forceReconnect: () => {},
  lastAction: null,

  defaultRedirectTo: "/auth/login",
  defaultSetCallbackUrlParam: true,
  defaultCallbackUrlParamName: "callbackUrl",
};

export const AuthContext = createContext<AuthContextProps>(authContextDefaults);

// Provider --------------------------------------------------------------------
export interface AuthProviderProps {
  children: React.ReactNode;
  
  /**
   * Default value for the useAuth hook to redirect the user
   * if authentication of authorization fails.
   * @default "/auth/login"
   */
  defaultRedirectTo?: string,
  /**
   * Default value for the useAuth hook for whether if a callback url param
   * should be appended to the redirect url.
   * @default true
   */
  defaultSetCallbackUrlParam?: boolean,
  /**
   * Default value for the useAuth hook for the name of the callback url param 
   * to set on redirect if setCallbackUrlParam is set to true.
   * @default "callbackUrl"
   */
  defaultCallbackUrlParamName?: string,
}

export type SocialAction = "login" | "connect" | null;

export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children, defaultRedirectTo, defaultSetCallbackUrlParam, defaultCallbackUrlParamName
}) => {
  const [online, setOnline] = useState<boolean>(typeof window !== "undefined" ? navigator.onLine : true);
  const [state, dispatch] = useImmerReducer(authReducer, authReducerDefaults);
  const router = useRouter();
  const lastAction = useRef<AuthContextProps["lastAction"]>(null);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    }
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    if (!state.userFetched && state.registeredHooks > 0 && !state.user && online) {
      dispatch({ type: "loading", payload: true });
      dispatch({ type: "clearErrors" });
      dispatch({ type: "userFetched", payload: true });
      
      (async () => {
        try {
          // Check if valid session exists
          const { data } = await fetchMyUser({ signal: abortController.signal, rejectRequest: false, onError: false });
          dispatch({ type: "setUser", payload: data ?? null });
        }
        catch (e) {
          if (isAxiosError(e)) {
            if (e.code !== AxiosError.ERR_CANCELED) {
              logger.debug("No valid session found", e);
            }
          }
        }
        dispatch({ type: "loading", payload: false });

        return () => {
          abortController.abort();
        }
      })();
    }
  }, [dispatch, state.registeredHooks, state.user, state.userFetched, online]);

  const emailLogin = useCallback(async (
    loginData: { 
      username?: string, 
      email?: string, 
      password?: string 
    },
    options?: {
      redirect?: boolean,
      redirectTo?: string,
    }
  ): Promise<User | null> => {
    const opts: typeof options = {
      redirect: true,
      redirectTo: "/",
      ...options
    };
    lastAction.current = "login";

    dispatch({ type: "loading", payload: true });
    let newUser: User | null = null;

    try {
      const resp = await http.post(api.endpoints.auth.login, loginData, { rejectRequest: false, onError: false });
      if (resp.status === 200) {
        if (useJwt) {
          clearJwtStorage();
          if (!jwtCookie) {
            setAccessToken(resp.data.access_token);
            setRefreshToken(resp.data.refresh_token);
          }
          setAccessTokenExpiration(resp.data.access_token_expiration);
          setRefreshTokenExpiration(resp.data.refresh_token_expiration);
        }
        
        if (resp.data.user)
          newUser = resp.data.user;
        else
          newUser = await getMyUser({ rejectRequest: false, onError: false });
      }
    }    
    catch (e) {
      logger.debug("Error signing in.", e);

      if (isAxiosError(e)) {
        const err = e as AxiosError<any, any>;

        const errorList = err.response?.data.non_field_errors;
        if (errorList) {
          if (errorList.includes("Unable to log in with provided credentials.") 
            || errorList.includes('Must include "username" and "password".')) 
            dispatch({ type: "addError", payload: AuthError.IncorrectCredentials });
          if (errorList.includes("E-mail is not verified.")) 
            dispatch({ type: "addError", payload: AuthError.EmailNotVerified });
        }
      }
    }

    dispatch({ type: "setUser", payload: newUser });
    dispatch({ type: "loading", payload: false });
    
    if (opts.redirect && newUser)
      router.push(opts.redirectTo!);

    return newUser;
  }, [dispatch, router]);

  const socialLoginAction = useCallback(async (
    provider: ProviderKey,
    socialAction: SocialAction, 
    data: any,
    options?: { redirect?: boolean, redirectTo?: string }
  ): Promise<User | null> => {
    const opts: typeof options = {
      redirect: true,
      redirectTo: "/",
      ...options
    };
    lastAction.current = "login";

    dispatch({ type: "loading", payload: true });
    const socialUrls = api.endpoints.auth.social[provider as keyof typeof api.endpoints.auth.social];

    let user: User | null = null;

    if (!socialUrls) {
      dispatch({ type: "addError", payload: AuthError.ProviderNotFound })
      logger.error(
        `No valid ${socialAction === "connect" ? "connection" : "login"} url for the ${provider} was found.`
      );
    }
    else {
      let url = socialUrls.login;

      if (socialAction === "connect")
        url = socialUrls.connect;

      if (url) {
        try {
          const resp = await http.post(url, data, { rejectRequest: false, onError: false });
          
          if (resp.status === 200) {
            if (useJwt) {
              clearJwtStorage();
              if (!jwtCookie) {
                setAccessToken(resp.data.access_token);
                setRefreshToken(resp.data.refresh_token);
              }
              setAccessTokenExpiration(resp.data.access_token_expiration);
              setRefreshTokenExpiration(resp.data.refresh_token_expiration);
            }

            if (resp.data.user)
              user = resp.data.user;
            else
              user = await getMyUser({ rejectRequest: false, onError: false });
          }
        }
        catch (e) {
          logger.debug("Error authenticating user.", e);

          if (isAxiosError(e)) {
            const err = e as AxiosError<any, any>;
    
            const errorList = err.response?.data.non_field_errors;
            if (errorList) {
              if (errorList.includes("Incorrect value")) 
                dispatch({ type: "addError", payload: AuthError.IncorrectCredentials });
              if (errorList.includes("User is already registered with this e-mail address.")) 
                dispatch({ type: "addError", payload: AuthError.EmailAlreadyRegistered });
            }
          }
        }
      }
    }
  
    dispatch({ type: "setUser", payload: user });
    dispatch({ type: "loading", payload: false });

    if (opts?.redirect && user)
      router.push(opts.redirectTo!);

    return user;
  }, [dispatch, router]);

  const socialLogin = useCallback(async (
    provider: ProviderKey,
    type: SocialAction, 
    options?: { 
      redirect?: boolean;
      redirectTo?: string;
      providersOptions?: ProvidersOptions;
      onPopupClosed?: () => void;
      onFinish?: (user: User | null) => void;
      onError?: (error: any) => void;
    }
  ) => {
    startSocialLogin(provider, {
      callback: async (data) => {
        if (data.error) {
          options?.onError?.(data.error);
          return;
        }
        const user = await socialLoginAction(
          provider, 
          type, 
          data, 
          options
        );
        options?.onFinish?.(user);
      },
      providers: options?.providersOptions,
      onPopupClosed: options?.onPopupClosed,
    });
  }, [socialLoginAction]);

  const logout = useCallback(async (options?: {
    redirect?: boolean,
    redirectTo?: string,
  }): Promise<void> => {
    const opts: typeof options = {
      redirect: true,
      redirectTo: defaultRedirectTo ?? authContextDefaults.defaultRedirectTo,
      ...options
    };
    lastAction.current = "logout";

    clearJwtStorage();

    try {
      await http.post(api.endpoints.auth.logout, { rejectRequest: false, onError: false });
    }
    catch (e) {
      logger.debug("Error.", e);
    }

    if (opts.redirect) {
      router.push(opts.redirectTo!);
      dispatch({ type: "setUser", payload: null });
    }
  }, [router, dispatch, defaultRedirectTo]);

  const forceReconnect = useCallback(() => {
    dispatch({ type: "userFetched", payload: false });
  }, [dispatch]);

  const changeName = useCallback(async (data: { first_name?: string, last_name?: string }) => {
    try {
      const resp = await updateMyInfo(data, { rejectRequest: false });
      const user = resp.data;
      dispatch({ type: "setUser", payload: user });
      return true;
    }
    catch (e) {
      logger.debug("Failed to update user.");
      return false;
    }
  }, [dispatch]);

  const contextValue: AuthContextProps = useMemo(() => ({
    authState: state,
    dispatchAuth: dispatch,
    emailLogin,
    socialLogin,
    logout,
    changeName,
    forceReconnect,
    lastAction: lastAction.current,
    defaultRedirectTo: defaultRedirectTo ?? authContextDefaults.defaultRedirectTo,
    defaultSetCallbackUrlParam: defaultSetCallbackUrlParam ?? authContextDefaults.defaultSetCallbackUrlParam,
    defaultCallbackUrlParamName: defaultCallbackUrlParamName ?? authContextDefaults.defaultCallbackUrlParamName,
  }), [state, dispatch, emailLogin, socialLogin, logout, changeName, forceReconnect, defaultRedirectTo, defaultSetCallbackUrlParam, defaultCallbackUrlParamName]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
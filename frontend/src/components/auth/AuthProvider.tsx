"use client";

import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { useImmerReducer } from "use-immer";
import { useRouter } from "next/navigation";

import { ApiError } from "@/api/types";
import { AuthError, User, JWTLoginInfo, LoginUserData } from "@/api/auth.types";
import { AuthAction, AuthState, authReducer } from "./AuthReducer";
import { ProviderErrors, ProviderKey, ProviderResponse, ProvidersOptions, startSocialLogin } from "@/utils/auth/oauth";
import { useMyUserQuery } from "@/api/queries/auth";
import { useLoginMutation, useLogoutMutation, useUnsafeSocialLogin } from "@/api/mutations/auth";
import api from "@/api";

// Reducer ---------------------------------------------------------------------
const authReducerDefaults: AuthState = {
  loading: false,
  errors: null,
  registeredHooks: 0,
};

// Context ---------------------------------------------------------------------
export interface AuthContextProps {
  user: User | null;
  loading: boolean;
  errors: AuthError[] | null;
  registeredHooks: number;
  dispatchAuth: React.Dispatch<AuthAction>;
  emailLogin: (loginData: LoginUserData,
    options?: { redirect?: boolean, redirectTo?: RedirectToUrl }) => Promise<User | null>;
  socialLogin: (provider: ProviderKey,
    type: SocialAction, 
    options?: SocialLoginCallbacks & { 
      redirect?: boolean;
      redirectTo?: RedirectToUrl;
      providersOptions?: ProvidersOptions;
    }) => void;
  logout: (options?: { redirect?: boolean, redirectTo?: RedirectToUrl }) => void,
  refetchUser: () => void;
  lastAction: "login" | "logout" | null;

  defaultRedirectTo?: RedirectToUrl,
  defaultSetCallbackUrlParam?: boolean,
  defaultCallbackUrlParamName?: string,
}

const authContextDefaults: AuthContextProps = {
  user: null,
  loading: false,
  errors: null,
  registeredHooks: 0,
  dispatchAuth: () => {},
  emailLogin: () => Promise.resolve(null),
  socialLogin: () => Promise.resolve(null),
  logout: () => {},
  refetchUser: () => {},
  lastAction: null,

  defaultRedirectTo: "/auth/login",
  defaultSetCallbackUrlParam: true,
  defaultCallbackUrlParamName: "callbackUrl",
};

export const AuthContext = createContext<AuthContextProps>(authContextDefaults);

export type RedirectToUrl = string | URL | ((user: User | null) => string | URL);

export function getRedirectUrl(
  user: User | null, 
  redirectTo: RedirectToUrl, 
): string | URL {
  if (typeof redirectTo === "function")
    return redirectTo(user);
  else
    return redirectTo;
}


// Provider --------------------------------------------------------------------
export interface AuthProviderProps {
  children: React.ReactNode;
  
  /**
   * Default value for the useAuth hook to redirect the user
   * if authentication of authorization fails.
   * @default "/auth/login"
   */
  defaultRedirectTo?: RedirectToUrl,
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

export interface SocialLoginCallbacks {
  onPopupClosed?: (error: ProviderErrors) => void;
  onFinish?: (user: User | null) => void;
  onError?: (
    error: ProviderErrors 
    | { 
      provider: "_"; 
      type: "invalid_url" | "authentication_error"; 
      payload: any;
    }
  ) => void;
}

export const AuthProvider = ({
  children, 
  defaultRedirectTo, 
  defaultSetCallbackUrlParam, 
  defaultCallbackUrlParamName,
}: AuthProviderProps) => {
  const [state, dispatch] = useImmerReducer(authReducer, authReducerDefaults);
  const router = useRouter();
  const lastAction = useRef<AuthContextProps["lastAction"]>(null);
  const myUserQuery = useMyUserQuery({
    enabled: state.registeredHooks > 0,
    refetchOnWindowFocus: false,
    retry: false,
  });
  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();
  const unsafeSocialLoginMutation = useUnsafeSocialLogin({
    onError: (error) => {
      if (isAxiosError(error)) {
        if (isAxiosError<ApiError>(error)) {
          if (error.response?.status === 500)
            dispatch({ type: "addError", payload: AuthError.ServerError });
          else if (error.response?.data.type === "validation_error") {
            for (const e of error.response?.data.errors ?? []) {
              if (e.detail.includes("Incorrect value"))
                dispatch({ type: "addError", payload: AuthError.IncorrectCredentials });
              else if (e.detail.includes("User is already registered with this e-mail address"))
                dispatch({ type: "addError", payload: AuthError.EmailAlreadyRegistered });
            }
          }
        }
      }
    }
  });

  useEffect(() => {
    dispatch({ type: "clearErrors" });
    if (myUserQuery.isError) {
      console.log("Error fetching user", myUserQuery.error);

      if (isAxiosError(myUserQuery.error)) {
        if (isAxiosError<ApiError>(myUserQuery.error)) {
          if (myUserQuery.error.response?.data.type === "server_error")
            dispatch({ type: "addError", payload: AuthError.ServerError });
          else if (myUserQuery.error.response?.data.type === "validation_error") {
            for (const error of myUserQuery.error.response?.data.errors ?? []) {
              if (error.detail.includes("E-mail is not verified"))
                dispatch({ type: "addError", payload: AuthError.EmailNotVerified });
              else
                dispatch({ type: "addError", payload: AuthError.IncorrectCredentials });
            }
          }
        }
      }
    }
  }, [dispatch, myUserQuery.error, myUserQuery.isError, myUserQuery.data]);

  const emailLogin = useCallback(async (
    loginData: LoginUserData,
    options?: {
      redirect?: boolean,
      redirectTo?: RedirectToUrl,
    }
  ): Promise<User | null> => {
    const opts: typeof options = {
      redirect: true,
      redirectTo: "/",
      ...options
    };
    lastAction.current = "login";

    dispatch({ type: "loading", payload: true });
    let user: User | null = null;

    try {
      const resp = await loginMutation.mutateAsync(loginData);
      if ((resp as JWTLoginInfo)?.user) {
        user = (resp as JWTLoginInfo).user;
        useMyUserQuery.setData(user);
      }
      else {
        user = await useMyUserQuery.refetch() ?? null;
      }
    }
    catch {
      console.log("Error signing in.");
    }

    dispatch({ type: "loading", payload: false });
    
    if (opts.redirect && opts.redirectTo && user)
      router.push(getRedirectUrl(user, opts.redirectTo).toString());

    return user;
  }, [dispatch, loginMutation, router]);

  const socialLogin = useCallback(async (
    provider: ProviderKey,
    type: SocialAction, 
    options?: SocialLoginCallbacks & { 
      redirect?: boolean;
      redirectTo?: RedirectToUrl;
      providersOptions?: ProvidersOptions;
    }
  ) => {
    const {
      redirect = true,
      redirectTo = "/",
    } = options ?? {};

    startSocialLogin(provider, {
      providers: options?.providersOptions,
      onError: options?.onError,
      onPopupClosed: options?.onPopupClosed,
      callback: async (data) => {
        lastAction.current = "login";

        dispatch({ type: "loading", payload: true });
        const socialUrls = api.endpoints.auth.social[provider as keyof typeof api.endpoints.auth.social];

        let user: User | null = null;

        if (!socialUrls) {
          dispatch({ type: "addError", payload: AuthError.ProviderNotFound });
          const message = `No valid ${type === "connect" ? "connection" : "login"} url for the ${provider} was found.`;
          console.error(message);
          options?.onError?.({
            provider: "_",
            type: "invalid_url",
            payload: message,
          });
        }
        else {
          let url = socialUrls.login;

          if (type === "connect")
            url = socialUrls.connect;

          if (url) {
            try {
              const resp = await unsafeSocialLoginMutation.mutateAsync({ 
                url,
                data: getProviderLoginDataFromResponse(data),
              });
              if ((resp as JWTLoginInfo)?.user) {
                user = (resp as JWTLoginInfo).user;
                useMyUserQuery.setData(user);
              }
              else {
                user = await useMyUserQuery.refetch() ?? null;
              }
            }
            catch (e) {
              console.error("Error authenticating user.");
              options?.onError?.({
                provider: "_",
                type: "authentication_error",
                payload: e,
              });
            }
          }
        }
      
        dispatch({ type: "loading", payload: false });

        options?.onFinish?.(user);

        if (redirect && redirectTo && user)
          router.push(getRedirectUrl(user, redirectTo).toString());
      },
    })
  }, [dispatch, router, unsafeSocialLoginMutation]);

  const logout = useCallback(async (options?: {
    redirect?: boolean,
    redirectTo?: RedirectToUrl,
  }): Promise<void> => {
    const opts: typeof options = {
      redirect: true,
      redirectTo: defaultRedirectTo ?? authContextDefaults.defaultRedirectTo,
      ...options
    };
    lastAction.current = "logout";
    
    try {
      await logoutMutation.mutateAsync();
    }
    catch (e) {
      console.error("Error.", e);
    }

    if (opts.redirect && opts.redirectTo) {
      router.push(getRedirectUrl(myUserQuery.data ?? null, opts.redirectTo).toString());
    }
  }, [defaultRedirectTo, logoutMutation, router, myUserQuery.data]);

  const refetchUser = useCallback(() => myUserQuery.refetch(), [myUserQuery]);

  const contextValue: AuthContextProps = useMemo(() => ({
    user: myUserQuery.data ?? null,
    loading: state.loading || myUserQuery.isLoading,
    errors: state.errors,
    registeredHooks: state.registeredHooks,
    dispatchAuth: dispatch,
    emailLogin,
    socialLogin,
    logout,
    refetchUser,
    lastAction: lastAction.current,
    defaultRedirectTo: defaultRedirectTo ?? authContextDefaults.defaultRedirectTo,
    defaultSetCallbackUrlParam: defaultSetCallbackUrlParam ?? authContextDefaults.defaultSetCallbackUrlParam,
    defaultCallbackUrlParamName: defaultCallbackUrlParamName ?? authContextDefaults.defaultCallbackUrlParamName,
  }), [myUserQuery.data, myUserQuery.isLoading, state.loading, state.errors, state.registeredHooks, dispatch, emailLogin, socialLogin, logout, refetchUser, defaultRedirectTo, defaultSetCallbackUrlParam, defaultCallbackUrlParamName]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

function getProviderLoginDataFromResponse(data: ProviderResponse) {
  switch (data.provider) {
    case "google": 
      return {
        code: data.code,
      };
    default: 
      return undefined;
  }
}

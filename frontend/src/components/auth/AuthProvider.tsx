import React, { createContext, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "react-query";
import { AxiosError, isAxiosError } from "axios";
import { getSession, signOut } from "next-auth/react";
import Router from "next/router";
import { useImmerReducer } from "use-immer";

import api from "../../utils/api";
import { axiosBase as http, axiosError as httpError } from "../../utils/axios";
import { getMyUser, updateMyInfo } from "../../utils/auth/auth.utils";
import logger from "@/utils/logger";
import { AuthError, User } from "@/utils/auth/auth.types";
import { AuthAction, AuthState, authReducer } from "./AuthReducer";
import { fetchMyUser } from "../../utils/auth/auth.utils";

// Reducer ---------------------------------------------------------------------
const authReducerDefaults: AuthState = {
  user: null,
  loading: true,
  errors: null,
  registeredHooks: 0,
};

// Context ---------------------------------------------------------------------
export interface AuthContextProps {
  authState: AuthState;
  dispatchAuth: React.Dispatch<AuthAction>;
  passwordLogin: (loginData: { username?: string, email?: string, password?: string },
    options?: { redirect?: boolean, redirectTo?: string }) => Promise<User | null>;
  logout: (options?: { redirect?: boolean, redirectTo?: string }) => void,
  changeName: (data: { first_name?: string, last_name?: string }) => Promise<boolean>;
  forceReconnect: () => void;

  defaultRedirectTo?: string,
  defaultSetCallbackUrlParam?: boolean,
  defaultCallbackUrlParamName?: string,
}

const authContextDefaults: AuthContextProps = {
  authState: authReducerDefaults,
  dispatchAuth: () => {},
  passwordLogin: () => Promise.resolve(null),
  logout: () => {},
  changeName: () => Promise.resolve(false),
  forceReconnect: () => {},

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

type SocialAction = "login" | "connect" | null;

export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children, defaultRedirectTo, defaultSetCallbackUrlParam, defaultCallbackUrlParamName
}) => {
  const [state, dispatch] = useImmerReducer(authReducer, authReducerDefaults);
  const queryClient = useQueryClient();

  const authenticatedQuery = useQuery({
    queryKey: ["auth-user"],
    queryFn: async ({ signal }) => {
      dispatch({ type: "loading", payload: true });
      dispatch({ type: "clearErrors" });
      
      let user: User | null = null;
      const socialAction = sessionStorage.getItem("socialAction") as SocialAction;

      if (socialAction && (socialAction === "login" || socialAction === "connect")) {
        // Check if a valid social access token exists, or if the user
        // is trying to connect its social account
        user = await socialLogin(socialAction, signal);
      }
      else {
        // Check if valid session exists
        const { data } = await fetchMyUser(http, signal);
        user = data;
      }

      return user;
    },
    enabled: state.registeredHooks > 0,
    // cacheTime: 1000 * 60 * 6,  // 6 minutes
    // staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchIntervalInBackground: false,
    onSettled: (data, error) => {
      if (sessionStorage.getItem("socialAction")) 
        sessionStorage.removeItem("socialAction");
      dispatch({ type: "setUser", payload: data ?? null });
      dispatch({ type: "loading", payload: false });
    },
  });

  const socialLogin = useCallback(async (
    socialAction: "login" | "connect" | null, abortSignal?: AbortSignal | undefined
  ): Promise<User | null> => {
    const sessionData = await getSession();

    if (sessionData && sessionData.user && 
      (sessionData.user as any).accessToken && (sessionData.user as any).provider) {
      const provider = (sessionData.user as any).provider;
      const socialUrls = api.endpoints.auth.social[provider as keyof typeof api.endpoints.auth.social];
      let url = socialUrls.login;

      if (socialAction === "connect")
        url = socialUrls.connect;

      if (url) {
        try {
          const resp = await http.post(url, {
            access_token: (sessionData.user as any).accessToken,
          }, {
            signal: abortSignal,
          });
  
          if (resp.status >= 200 || resp.status < 300) {
            const user = await getMyUser(http, abortSignal);
            signOut({ redirect: false });
            return user;
          }
        }
        catch (e) {
          logger.debug("Error authenticating user.", e);
          signOut({ redirect: false });

          if (isAxiosError(e)) {
            const err = e as AxiosError<any, any>;
    
            const errorList = err.response?.data.non_field_errors;
            if (errorList) {
              if (errorList.includes("Incorrect value")) 
                dispatch({ type: "addError", payload: AuthError.IncorrectCredentials })
              if (errorList.includes("User is already registered with this e-mail address.")) 
                dispatch({ type: "addError", payload: AuthError.EmailAlreadyRegistered })
            }
          }

          throw e; // rethrow error to be handled by caller
        }
      }
      else {
        dispatch({ type: "addError", payload: AuthError.ProviderNotFound })
        throw new Error(
          `No valid ${socialAction === "connect" ? "connection" : "login"} url for the ${provider} was found.`
        );
      }
    }

    return null;
  }, []);

  const passwordLogin = useCallback(async (
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

    dispatch({ type: "loading", payload: true });
    let newUser: User | null = null;

    try {
      const resp = await http.post(api.endpoints.auth.login, loginData);
      if (resp.status === 204) {
        newUser = await getMyUser(http);
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
      Router.push(opts.redirectTo!);

    return newUser;
  }, []);

  const logout = useCallback(async (options?: {
    redirect?: boolean,
    redirectTo?: string,
  }): Promise<void> => {
    const opts: typeof options = {
      redirect: true,
      redirectTo: "/auth/login",
      ...options
    };

    queryClient.invalidateQueries();

    try {
      await http.post(api.endpoints.auth.logout);
    }
    catch (e) {
      logger.debug("Error.", e);
    }

    if (opts.redirect) 
      Router.push(opts.redirectTo!).then(x => dispatch({ type: "setUser", payload: null }));
  }, [queryClient]);

  const forceReconnect = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["auth-user"],
      refetchActive: true,
      refetchInactive: false,
    });
  }, [queryClient]);

  const changeName = useCallback(async (data: { first_name?: string, last_name?: string }) => {
    try {
      const resp = await updateMyInfo(httpError, data);
      const user = resp.data;
      dispatch({ type: "setUser", payload: user });
      return true;
    }
    catch (e) {
      logger.debug("Failed to update user.");
      return false;
    }
  }, []);

  const contextValue: AuthContextProps = useMemo(() => ({
    authState: state,
    dispatchAuth: dispatch,
    passwordLogin,
    logout,
    changeName,
    forceReconnect,
    defaultRedirectTo: defaultRedirectTo ?? authContextDefaults.defaultRedirectTo,
    defaultSetCallbackUrlParam: defaultSetCallbackUrlParam ?? authContextDefaults.defaultSetCallbackUrlParam,
    defaultCallbackUrlParamName: defaultCallbackUrlParamName ?? authContextDefaults.defaultCallbackUrlParamName,
  }), [state, dispatch, passwordLogin, logout, changeName, forceReconnect, defaultRedirectTo, defaultSetCallbackUrlParam, defaultCallbackUrlParamName]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
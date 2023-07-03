import { ComponentType, useEffect, useRef, useState } from "react";
import { useAuth } from "./useAuth";
import CircularProgress from "@mui/material/CircularProgress";
import { useRouter } from "next/navigation";
import { User } from "@/utils/api/auth.types";

/**
 * Shows a spinner while user authentication/authorization is being checked.
 * After authentication/authorization is checked, the component is rendered.
 */
export function withAuth<T extends JSX.IntrinsicAttributes>(
  Component: ComponentType<T>, 
  options?: Parameters<typeof useAuth>[0]
) {
  const AuthProtected = (props: T) => {
    const { isAuthenticated, isAuthorized, loading } = useAuth(options);
    if (loading) {
      return (
        <div className="h-full bg-neutral-100 grid place-items-center">
          <CircularProgress />
        </div>
      );
    }

    return isAuthenticated && isAuthorized ? <Component {...props} /> : null;
  };

  return AuthProtected;
}

/**
 * Shows a spinner while user authentication/authorization is being checked.
 * After authentication/authorization is checked, if the user is not authenticated,
 * the component is rendered. Otherwise, the user is redirected to the specified URL.
 * @param redirectTo The URL to redirect to if the user is authenticated. Defaults to "/".
 */
export function withRedirectIfLoggedIn<T extends JSX.IntrinsicAttributes>(
  Component: ComponentType<T>, redirectTo?: (user: User | null) => URL
) {
  const AuthProtected = (props: T) => {
    const { user, isAuthenticated, loading } = useAuth({
      redirectIfNotAuthenticated: false,
      redirectIfNotAuthorized: false,
    });
    const router = useRouter();
    const firstLoad = useRef(false);

    useEffect(() => {
      if (!loading && !firstLoad.current)
        firstLoad.current = true;
      if (user && !loading) {
        const url = redirectTo ? redirectTo(user) : new URL("/", window.location.origin);
        router.push(url.toString());
      }
    }, [user, loading, router]);

    return (<>
      <Component {...props} />
      {(!firstLoad.current && loading) || isAuthenticated ? (
        <div className="absolute inset-0 h-full bg-neutral-100 grid place-items-center">
          <CircularProgress />
        </div>
      ) : null}
    </>);
  };

  return AuthProtected;
}

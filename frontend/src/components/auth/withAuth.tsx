import { ComponentType, JSXElementConstructor, useEffect, useRef } from "react";
import { Paper, LoadingOverlay, Loader } from "@mantine/core";
import { useAuth } from "@/hooks/auth";
import { useRouter } from "next/navigation";
import { User } from "@/api/services/auth/types";

/**
 * Shows a spinner while user authentication/authorization is being checked.
 * After authentication/authorization is checked, the component is rendered.
 * NOTE: client-side only.
 */
export function withAuth<T>(
  Component: JSXElementConstructor<T>, 
  options?: Parameters<typeof useAuth>[0]
) {
  const AuthProtected = (props: T) => {
    const { isAuthenticated, isAuthorized, loading } = useAuth(options);

    if (loading) {
      return (
        <Paper className="h-full">
          <LoadingOverlay visible />
        </Paper>
      );
    }

    return isAuthenticated && isAuthorized ? <Component {...props as any} /> : null;
  };

  return AuthProtected;
}

/**
 * Shows a spinner while user authentication/authorization is being checked.
 * After authentication/authorization is checked, if the user is not authenticated,
 * the component is rendered. Otherwise, the user is redirected to the specified URL.
 * NOTE: client-side only.
 * @param redirectTo The URL to redirect to if the user is authenticated. Defaults to "/".
 */
export function withRedirectIfLoggedIn<T>(
  Component: JSXElementConstructor<T>, redirectTo?: (user: User | null) => string | URL
) {
  const AuthProtected = (props: T) => {
    const { user, isAuthenticated, loading } = useAuth({
      redirectIfNotAuthenticated: false,
      redirectIfNotAuthorized: false,
      triggerAuthentication: false,
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
      <Component {...props as any} />
      {(!firstLoad.current && loading) || isAuthenticated ? (
        <div className="absolute inset-0 h-full bg-neutral-100 grid place-items-center">
          <Loader />
        </div>
      ) : null}
    </>);
  };

  return AuthProtected;
}

"use client";

import { NavLink } from "@/components/shared";
import { useAuth } from "@/hooks/auth";
import { getOrRefreshAccessToken } from "@/api/auth";
import Link from "next/link";
import { Button } from "@mantine/core";
import { 
  showSuccessNotification,
  showErrorNotification,
  showWarningNotification,
  showInfoNotification,
} from "@/components/ui/notifications";

const Home = () => {
  const { user, loading, login, logout, isAuthorized } = useAuth({
    skipAll: false,
    redirectIfNotAuthorized: false,
    rolesWhitelist: ["Admin"]
  });

  return (
    <section className="h-full w-full p-4">
      {!user && loading ? <div>Loading...</div> : null}
      {user ? `User: ${user.email}, authorized: ${isAuthorized}` : null}

      <br />

      {user ? (
        <div className="p-2 flex gap-2">
          <button 
            className="p-2 bg-blue-500 text-white rounded-md"
            onClick={() => logout()}
          >
            Logout
          </button>

          <button 
            className="p-2 bg-blue-500 text-white rounded-md"
            onClick={async () => {
              console.log(await getOrRefreshAccessToken())
            }}
          >
            Refresh token
          </button>

          <button 
            className="p-2 bg-blue-500 text-white rounded-md"
            onClick={async () => {
              login({ socialLogin: { provider: "google", type: "connect" } })
            }}
          >
            Connect account to Google
          </button>
        </div>
      ) : (
        null
      )}

      <div className="p-2 flex gap-2">
        <Link 
          href="auth/login" 
          className="p-2 bg-blue-500 text-white rounded-md"
        >
          Go to Login
        </Link>
      </div>

      <div className="flex gap-2">
        <NavLink href="/" 
          classes={{
            active: "text-blue-500",
            inactive: "text-red-500",
          }}
        >
          Test
        </NavLink>
        <NavLink href="/test" 
          classes={{
            active: "text-blue-500",
            inactive: "text-red-500",
          }}
        >
          Test
        </NavLink>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={() => showSuccessNotification({
            title: "Success notification",
            message: "Success notification",
          })}
        >
          Success Notification
        </Button>

        <Button
          onClick={() => showErrorNotification({
            title: "Error notification",
            message: "Error notification",
          })}
        >
          Error Notification
        </Button>

        <Button
          onClick={() => showWarningNotification({
            title: "Warning notification",
            message: "Warning notification",
          })}
        >
          Warning Notification
        </Button>

        <Button
          onClick={() => showInfoNotification({
            title: "Info notification",
            message: "Info notification",
          })}
        >
          Info Notification
        </Button>
      </div>
    </section>
  )
}

export default Home;

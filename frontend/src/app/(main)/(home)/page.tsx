"use client";

import { NavLink } from "@/components/shared";
import { useAuth } from "@/hooks/auth";
import { getOrRefreshAccessToken } from "@/api/auth";
import Link from "next/link";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";

const Home = () => {
  const { user, loading, login, logout, isAuthorized } = useAuth({
    skipAll: false,
    redirectIfNotAuthorized: false,
    rolesWhitelist: ["Admin"]
  });

  return (
    <section className="p-4">
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

      <div>
        <Button
          onClick={() => {
            notifications.show({
              title: "Success",
              message: "This is success notification",
            })
          }}
        >
          Success Notification
        </Button>
      </div>
    </section>
  )
}

export default Home;

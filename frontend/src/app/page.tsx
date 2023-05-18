"use client";

import { NavLink } from "@/components/shared";
import { useAuth } from "../components/auth/useAuth";
import { getOrRefreshAccessToken } from "@/utils/auth/auth.utils";
import Link from "next/link";

const Home = () => {
  const { user, loading, login, logout } = useAuth({
    skipAll: true,
  });

  return (
    <main>
      {!user && loading ? <div>Loading...</div> : null}
      {user ? `User: ${user.email}` : null}

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
    </main>
  )
}

export default Home;

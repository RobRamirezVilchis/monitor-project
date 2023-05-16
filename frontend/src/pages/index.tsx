import { NextPage } from "next"

import { useAuth } from "../components/auth/useAuth";
import { getOrRefreshAccessToken } from "@/utils/auth/auth.utils";
import Link from "next/link";

const Home: NextPage = () => {
  const { user, login, logout } = useAuth({
    skipAll: true,
  });

  return (
    <main>
      User: {user ? user.email : "Not logged in"}

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
    </main>
  )
}

export default Home;

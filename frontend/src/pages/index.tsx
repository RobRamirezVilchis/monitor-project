import { NextPage } from "next"

import { useAuth } from "../components/auth/useAuth";
import { getOrRefreshAccessToken } from "@/utils/auth/auth.utils";

const Home: NextPage = () => {
  const { user, logout } = useAuth({
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
        </div>
      ) : null}
    </main>
  )
}

export default Home;

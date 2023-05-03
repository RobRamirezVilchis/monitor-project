import { NextPage } from "next"
import { useAuth } from "../components/auth/useAuth";

const Home: NextPage = () => {
  const { user, logout } = useAuth({
    skipAll: true,
  });

  return (
    <main>
      User: {user ? user.email : "Not logged in"}

      <br />

      {user ? (
        <div className="p-2">
          <button 
            className="p-2 bg-blue-500 text-white rounded-md"
            onClick={() => logout()}
          >
              Logout
          </button>
        </div>
      ) : null}
    </main>
  )
}

export default Home;

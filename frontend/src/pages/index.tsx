import { NextPage } from "next"
import { useAuth } from "../components/auth/useAuth";

const Home: NextPage = () => {
  const { user } = useAuth({
    skipAll: true,
  });

  return (
    <main>
      User: {user ? user.email : "Not logged in"}
    </main>
  )
}

export default Home;

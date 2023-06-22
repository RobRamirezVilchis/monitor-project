import { LoginForm } from "./LoginForm";
import SocialProviders from "./SocialProviders";
import Link from "next/link";

const Login = () => {
  return (
    <div className="h-full grid place-items-center">
      <div className="border border-1 rounded-xl p-6">
        <h1 className="text-center font-bold">Login</h1>

        <div className="flex flex-col gap-2">
          <LoginForm />
        </div>

        <hr className="my-3" />

        <div>
          <SocialProviders />

          <div className="flex flex-col gap-4 mt-4 z-10">
            <div className="text-center">
              <Link href="/auth/password-reset" className="text-blue-500">
                Olvidé mi contraseña
              </Link>
            </div>
            <div className="text-center">
              <Link href="/auth/register" className="text-blue-500">
                Crear cuenta
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

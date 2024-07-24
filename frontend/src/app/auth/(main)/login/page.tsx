import { Divider } from "@mantine/core";
import { LoginForm } from "./LoginForm";
import SocialProviders from "./SocialProviders";
import Link from "next/link";
import Introid from "../../../../media/introid_bw.png";
import Image from "next/image";

const Login = () => {
  return (
    <>
      <div className="flex justify-center mb-10">
        <Image
          src={Introid}
          width={200}
          height={50}
          alt="Picture of the author"
        ></Image>
      </div>

      <div className="flex flex-col gap-2">
        <LoginForm />
      </div>

      <Divider className="my-3" />

      <div>
        <SocialProviders />

        <div className="flex flex-col gap-4 mt-4 z-10">
          <div className="text-center">
            <Link
              href="/auth/register"
              className="text-blue-500 hover:text-gray-600 font-semibold transition-all"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;

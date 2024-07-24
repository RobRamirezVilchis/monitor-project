import { ReactNode } from "react";
import Introid from "../../../../../media/introid_bw.png";
import Image from "next/image";

interface RegisterLayoutProps {
  children: ReactNode;
}

const RegisterLayout = ({ children }: RegisterLayoutProps) => {
  return (
    <>
      <div className="flex justify-center mb-6">
        <Image
          src={Introid}
          width={200}
          height={50}
          alt="Picture of the author"
        ></Image>
      </div>
      <h1 className="text-center font-bold text-lg mb-4">Registro</h1>

      {children}
    </>
  );
};

export default RegisterLayout;

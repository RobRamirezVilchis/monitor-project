import { ReactNode } from "react";

interface RegisterLayoutProps {
  children: ReactNode;
}

const RegisterLayout = ({
  children,
}: RegisterLayoutProps) => {
  return (
    <>
      <h1 className="text-center font-bold">Registro</h1>

      {children}
    </>
  );
}

export default RegisterLayout;

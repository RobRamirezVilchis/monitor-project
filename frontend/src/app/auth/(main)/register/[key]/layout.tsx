import { ReactNode } from "react";

interface RegisterActivationLayoutProps {
  children: ReactNode;
}

const RegisterActivationLayout = ({
  children,
}: RegisterActivationLayoutProps) => {
  return (
    <>
      <h1 className="text-blue-600 text-2xl capitalize mb-4 text-center">
        Activación de cuenta
      </h1>

      {children}
    </>
  );
};

export default RegisterActivationLayout;
import { ReactNode } from "react";

interface PasswordResetLayoutProps {
  children: ReactNode;
}

const PasswordResetLayout = ({
  children,
}: PasswordResetLayoutProps) => {
  return (
    <>
      <h1 className="text-blue-600 text-2xl capitalize mb-4 text-center">
        Solicitar cambio de contraseña
      </h1>

      {children}
    </>
  );
}

export default PasswordResetLayout;

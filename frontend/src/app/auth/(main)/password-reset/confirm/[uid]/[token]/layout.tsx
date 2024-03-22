import { ReactNode } from "react";

interface PasswordResetConfirmationLayoutProps {
  children: ReactNode;
}

const PasswordResetConfirmationLayout = ({
  children,
}: PasswordResetConfirmationLayoutProps) => {
  return (
    <>
      <h1 className="text-blue-600 text-2xl capitalize mb-4 text-center">
        Cambio de contraseña
      </h1>

      {children}
    </>
  );
}

export default PasswordResetConfirmationLayout;

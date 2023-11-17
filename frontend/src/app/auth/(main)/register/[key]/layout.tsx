import React from "react";

interface RegisterActivationLayoutProps {
  children: React.ReactNode;
}

const RegisterActivationLayout: React.FC<RegisterActivationLayoutProps> = ({ children }) => {
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
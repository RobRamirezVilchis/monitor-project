import React from "react";

interface RegisterActivationLayoutProps {
  children: React.ReactNode;
}

const RegisterActivationLayout: React.FC<RegisterActivationLayoutProps> = ({ children }) => {
  return (
    <main className="h-full grid place-items-center">
      <div className="border border-1 rounded-xl p-6">
        <h1 className="text-blue-600 text-2xl capitalize mb-4 text-center">
          Activación de cuenta
        </h1>

        {children}
      </div>
    </main>
  );
};

export default RegisterActivationLayout;
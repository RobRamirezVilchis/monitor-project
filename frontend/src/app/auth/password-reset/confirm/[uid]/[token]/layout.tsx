import React from "react";

interface PasswordResetConfirmationLayoutProps {
  children: React.ReactNode;
}

const PasswordResetConfirmationLayout: React.FC<PasswordResetConfirmationLayoutProps> = ({ 
  children 
}) => {
  return (
    <main className="h-full grid place-items-center">
      <section className="border border-1 rounded-xl p-6">
        <h1 className="text-blue-600 text-2xl capitalize mb-4 text-center">
          Cambio de contraseña
        </h1>

        {children}
      </section>
    </main>
  );
}

export default PasswordResetConfirmationLayout;

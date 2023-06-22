import React from "react";

interface RegisterLayoutProps {
  children: React.ReactNode;
}

const RegisterLayout: React.FC<RegisterLayoutProps> = ({ 
  children 
}) => {
  return (
    <div className="h-full grid place-items-center">
      <div className="border border-1 rounded-xl p-6 max-w-2xl">
        <h1 className="text-center font-bold">Registro</h1>

        {children}
      </div>
    </div>
  );
}

export default RegisterLayout;

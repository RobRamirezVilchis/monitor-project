import React from "react";

interface RegisterLayoutProps {
  children: React.ReactNode;
}

const RegisterLayout: React.FC<RegisterLayoutProps> = ({ 
  children 
}) => {
  return (
    <>
      <h1 className="text-center font-bold">Registro</h1>

      {children}
    </>
  );
}

export default RegisterLayout;

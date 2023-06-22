"use client";

import React from "react";
import { SnackbarProvider } from "notistack";

import { AuthProvider } from "@/components/auth/AuthProvider";

interface ProvidersProps {
  children: React.ReactNode
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      <SnackbarProvider maxSnack={5} dense autoHideDuration={10000}>
        {children}
      </SnackbarProvider>
    </AuthProvider>
  );
}

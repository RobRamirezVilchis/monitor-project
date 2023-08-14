"use client";

import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SnackbarProvider } from "notistack";

import { AuthProvider } from "@/components/auth/AuthProvider";
import defaultQueryClient from "@/api/clients/defaultQueryClient";

interface ProvidersProps {
  children: React.ReactNode
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={defaultQueryClient}>
      <AuthProvider defaultSetCallbackUrlParam={false}>
        <SnackbarProvider maxSnack={5} dense autoHideDuration={10000}>
          {children}
        </SnackbarProvider>
      </AuthProvider>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

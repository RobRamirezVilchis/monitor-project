"use client";

import Cookies from "js-cookie";
import React from "react";
import { MantineProvider } from "@mantine/core";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SnackbarProvider } from "notistack";

import { AuthProvider } from "@/components/auth/AuthProvider";
import defaultTheme from "@/components/ui/themes/default";
import defaultQueryClient from "@/api/clients/defaultQueryClient";

interface ProvidersProps {
  children: React.ReactNode;
}

// Set tz cookie with the client's timezone
Cookies.set("tz", Intl.DateTimeFormat().resolvedOptions().timeZone, {
  path: "/",
  sameSite: "Lax",
});

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <MantineProvider theme={defaultTheme}>
      <QueryClientProvider client={defaultQueryClient}>
        <AuthProvider defaultSetCallbackUrlParam={false}>
          <SnackbarProvider maxSnack={5} dense autoHideDuration={10000}>
            {children}
          </SnackbarProvider>
        </AuthProvider>

        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </MantineProvider>
  );
}

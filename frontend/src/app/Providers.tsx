"use client";

import "dayjs/locale/es";
import { DatesProvider } from "@mantine/dates";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Cookies from "js-cookie";

import { AuthProvider } from "@/components/auth/AuthProvider";
import { ConfirmDialogProvider } from "@/components/shared";
import defaultTheme from "@/components/ui/themes/default";
import defaultQueryClient from "@/api/clients/defaultQueryClient";

interface ProvidersProps {
  children: ReactNode;
}

// Set tz cookie with the client's timezone
Cookies.set("tz", Intl.DateTimeFormat().resolvedOptions().timeZone, {
  path: "/",
  sameSite: "Lax",
});

export const Providers = ({ 
  children 
}: ProvidersProps) => {
  return (
    <MantineProvider theme={defaultTheme}>
      <DatesProvider settings={{ firstDayOfWeek: 0, locale: "es" }}>
        <Notifications limit={5} autoClose={10000} position="bottom-right" zIndex={1000} />
        <QueryClientProvider client={defaultQueryClient}>
          <ConfirmDialogProvider
            title="Confirmar acción"
            content="¿Está seguro que desea realizar esta acción?"
            labels={{
              confirm: "Confirmar",
              cancel: "Cancelar",
            }}
            cancelProps={{
              color: "red",
            }}
            modalProps={{
              size: "md",
              centered: true,
            }}
          >
            <AuthProvider defaultSetCallbackUrlParam={false}>
              {children}
            </AuthProvider>
          </ConfirmDialogProvider>

          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </DatesProvider>
    </MantineProvider>
  );
}

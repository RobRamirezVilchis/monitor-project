import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@/styles/globals.css";

import { ColorSchemeScript, MantineColorScheme } from "@mantine/core";
import { cookies } from "next/headers";
import { Metadata, Viewport } from "next";
import clsx from "clsx";
import Script from "next/script";
import { type ReactNode } from "react";

import { Providers } from "./Providers";
import { colorSchemeCookieName } from "@/ui/themes/cookieColorSchemeManager";
import fonts from "@/ui/fonts";

interface RootLayoutProps {
  children: ReactNode;
}

export const metadata: Metadata = {
  title: "App Title",
  description: "Description",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const RootLayout = ({ children }: RootLayoutProps) => {
  const cookieStore = cookies();
  let colorScheme = cookieStore.get(colorSchemeCookieName)?.value as
    | MantineColorScheme
    | undefined;
  colorScheme = colorScheme === "auto" ? undefined : colorScheme;

  return (
    // Set TailwindCSS color scheme based on cookie managed by Mantine ColorSchemeManager
    <html lang="en" className={colorScheme}>
      <head>
        {/* Google 3P Authorization Library */}
        {/* Types package: @types/google.accounts */}
        <Script src="https://accounts.google.com/gsi/client" />

        <ColorSchemeScript defaultColorScheme={colorScheme} />
        <title>Monitor</title>
      </head>
      <body
        className={clsx(
          fonts.roboto.className,
          "bg-[#f0f0f0] dark:bg-dark-800"
        )}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;

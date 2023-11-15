import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import '@mantine/notifications/styles.css';
import "@/styles/globals.css";

import { ColorSchemeScript } from "@mantine/core";
import { Metadata } from "next";
import { cookies } from "next/headers";

import { Providers } from "./Providers";
import fonts from "@/ui/fonts";

interface RootLayoutProps {
  children: React.ReactNode
}

export const metadata: Metadata = {
  title: "App Title",
  description: "Description",
  viewport: "width=device-width, initial-scale=1",
  icons: [ { rel: "icon", url: "/favicon.ico" } ]
}

const RootLayout = ({ 
  children 
}: RootLayoutProps) => {
  const cookieStore = cookies();
  const tailwindCSSColorScheme = cookieStore.get("color-scheme")?.value || "light";

  return (
    <html lang="en" className={tailwindCSSColorScheme}>
      <head>
        <ColorSchemeScript />
      </head>
      <body className={fonts.roboto.className} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

export default RootLayout;

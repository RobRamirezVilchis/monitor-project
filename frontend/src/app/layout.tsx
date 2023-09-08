import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@/styles/globals.css";

import { ColorSchemeScript } from "@mantine/core";
import { Metadata } from "next";
import { Roboto_Flex as Roboto } from "next/font/google";

import { Providers } from "./Providers";

interface RootLayoutProps {
  children: React.ReactNode
}

const roboto = Roboto({
  weight: ["400", "500", "600", "700"],
  style: ["normal"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "App Title",
  description: "Description",
  viewport: "width=device-width, initial-scale=1",
  icons: [ { rel: "icon", url: "/favicon.ico" } ]
}

const RootLayout = ({ 
  children 
}: RootLayoutProps) => (
  <html lang="en">
    <head>
      <ColorSchemeScript />
    </head>
    <body className={roboto.className} suppressHydrationWarning>
      <Providers>
        {children}
      </Providers>
    </body>
  </html>
)

export default RootLayout;

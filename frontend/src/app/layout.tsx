import "@/styles/globals.css";

import { Metadata } from "next";
import { Roboto_Flex as Roboto } from "next/font/google";

import { Providers } from "./Providers";

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

interface RootLayoutProps {
  children: React.ReactNode
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <body className={roboto.className} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

export default RootLayout;

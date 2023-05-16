import "@/styles/globals.css";
import "@/styles/react-datepicker-custom.css"

import type { AppProps } from "next/app";
import Head from "next/head";
import { Roboto_Flex } from "next/font/google";
import { SnackbarProvider } from "notistack";

import { AuthProvider } from "@/components/auth/AuthProvider";

const roboto = Roboto_Flex({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (<>
    <Head>
      <title>App Title</title>
      <meta name="description" content="Description" />
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    
    <div id="__app" className={roboto.className}>
      <AuthProvider>
        <SnackbarProvider maxSnack={5} dense autoHideDuration={10000}>
          <Component {...pageProps} />
        </SnackbarProvider>
      </AuthProvider>
    </div>
  </>);
}

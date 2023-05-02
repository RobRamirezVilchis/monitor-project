import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export const authOptions: NextAuthOptions = {
  // https://next-auth.js.org/configuration/providers/oauth
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  theme: {
    colorScheme: "light",
  },
  callbacks: {
    async jwt({ account, token }) {
      // add the access token to the token object
      // so the session can access it
      if (account) {
        //! Previous versions of dj_rest_auth/allauth:
        // token.accessToken = account.access_token;
        //! Latest versions of dj_rest_auth/allauth:
        token.accessToken = account.id_token;
        token.provider = account.provider;
      }

      return token;
    },
    async session({ session, token }) {
      // send the access token in the session object to the client
      // so the client can authenticate in the Django server
      if (token.accessToken) {
        (session.user as any).accessToken = token.accessToken;
        (session.user as any).provider = token.provider;
      }

      return session;
    },
  },
}

export default NextAuth(authOptions)
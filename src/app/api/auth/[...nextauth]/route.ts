// pages/api/auth/[...nextauth].ts

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_CLIENTID!,
      clientSecret: process.env.NEXT_PUBLIC_CLIENTSECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Save the Google ID token
      if (account?.id_token) {
        token.googleIdToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Pass Google ID token to session
      session.googleIdToken = token.googleIdToken;
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});

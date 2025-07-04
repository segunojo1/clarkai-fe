// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_CLIENTID as string,
      clientSecret: process.env.NEXT_PUBLIC_CLIENTSECRET as string,
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      // Send user data to your backend on initial sign in
      if (account && user) {
        try {
          const response = await fetch(`${process.env.BACKEND_URL}/api/auth/google`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              access_token: account.access_token,
              id_token: account.id_token,
              email: user.email,
              name: user.name,
              image: user.image,
            }),
          });

          const backendUser = await response.json();
          
          // Add backend user ID to token
          token.backendUserId = backendUser.id;
          token.backendAccessToken = backendUser.accessToken; // if your backend returns one
        } catch (error) {
          console.error("Backend auth failed:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Send backend user ID to client
      // session.backendUserId = token.backendUserId;
      // session.backendAccessToken = token.backendAccessToken;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt", // Recommended when not using a database
  },
});

export { handler as GET, handler as POST };
// app/api/auth/[...nextauth]/route.ts
import authService from "@/services/auth.service";
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
          const response = authService.verifyOathToken(account.access_token)

          // const backendUser = await response.json();
          
          // Add backend user ID to token
          // token.backendUserId = backendUser.id;
          // token.backendAccessToken = backendUser.accessToken;
          
          // // Check if user exists in our database
          // const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${backendUser.id}`);
          // const existingUser = await userResponse.json();
          
          // Set onboarding status
          // token.isOnboardingNeeded = !existingUser.data;
        } catch (error) {
          console.error("Backend auth failed:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Add backend user ID and onboarding status to session
      // session.user.backendUserId = token.backendUserId;
      // session.user.isOnboardingNeeded = token.isOnboardingNeeded;
      
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt", // Recommended when not using a database
  },
});

export { handler as GET, handler as POST };
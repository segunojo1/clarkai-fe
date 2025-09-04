// app/api/auth/[...nextauth]/route.ts
import authService from "@/services/auth.service";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
          scope: "openid profile email",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      try {
        // Only handle Google OAuth
        if (account?.provider === "google") {
          return true; // Always allow signin, we'll handle user status in jwt callback
        }
        return true;
      } catch (error) {
        console.error("SignIn callback error:", error);
        return false;
      }
    },
    async jwt({ token, account, profile, trigger, session }) {
      // Handle Google OAuth
      if (account && account.provider === "google") {
        try {
          // Call your Google login endpoint
          const googleResponse = await authService.googleLogin({
            email: profile?.email || "",
            name: profile?.name || "",
            image_url: profile?.image || "",
          });

          // Store the backend token and user data
          token.backendAccessToken = googleResponse.token;
          token.user = googleResponse.user;
          token.isOnboardingNeeded = !googleResponse.user.account_completed;
          
        } catch (error) {
          console.error("Google login error in jwt callback:", error);
          throw error;
        }
      }

      // Handle session update if triggered
      if (trigger === "update" && session?.user) {
        const existingUser =
          token.user && typeof token.user === "object"
            ? (token.user as Record<string, unknown>)
            : {};
        token.user = { ...existingUser, ...session.user } as any;
      }

      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token.backendAccessToken) {
        session.user.backendAccessToken = token.backendAccessToken as string;
      }
      
      if (token.user) {
        session.user.id = (token.user as any).id;
        session.user.name = (token.user as any).name;
        session.user.email = (token.user as any).email;
        session.user.isOnboardingNeeded = token.isOnboardingNeeded as boolean;
        
      }

      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
});

export { handler as GET, handler as POST };
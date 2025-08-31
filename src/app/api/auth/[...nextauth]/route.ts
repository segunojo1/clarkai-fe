// app/api/auth/[...nextauth]/route.ts
// import authService from "@/services/auth.service";
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
      if (account && user) {
        try {
          console.log("=== OAuth Verification Debug ===");
          console.log("Access Token:", account.access_token);

          // For Google OAuth, we need to verify the token and handle signup if new user
          const response = await authService.verifyOathToken(account.access_token);
          // const response = process.env.NEXT_PUBLIC_ACCESS_TOKEN || '';
          // Only attempt prto sign up if this is a new user (indicated by isNewUser flag)
         if (user) {
            try {
              await authService.signup({
                email: user.email || '', 
                name: user.name || '', 
                nickname: user.name || '', 
                oauth: true, 
                oauth_method: "google"
              });
              console.log("Google OAuth signup successful");
            } catch (signupError) {
              console.log("Signup error:", signupError);
              
              // Check if it's a duplicate user error (status 409)
              const isDuplicateUser = 
                (signupError as any)?.response?.status === 409 || 
                (signupError as any)?.status === 409 ||
                (signupError as any)?.message?.includes('User already exists.') ||
                (signupError as any)?.error === 'User already exists.';

              if (isDuplicateUser) {
                console.log("User already exists, attempting login...");
                try {
                  await authService.login({
                    email: user.email || '', 
                    oauth: true, 
                    oauth_method: "google"
                  });
                  console.log("Google OAuth login successful");
                } catch (loginError) {
                  console.error("Error during Google OAuth login:", loginError);
                  throw new Error(`Google OAuth login failed: ${(loginError as any)?.error || (loginError as any)?.message}`);
                }
              } else {
                // For other errors, rethrow with more context
                console.error("Error during Google OAuth signup:", signupError);
                const errorMessage = (signupError as any)?.error || 
                (signupError as any)?.message || 
                                  'Unknown error during Google OAuth signup';
                throw new Error(`Google OAuth signup failed: ${errorMessage}`);
              }
            }
          }
          
          console.log("Verify Token Response:", JSON.stringify(response, null, 2));

          const backendUser = response;

          // attach stuff to the token
          token.backendUserId = (backendUser as any).id;
          token.backendAccessToken = (backendUser as any).accessToken;
          token.googleAccessToken = account.access_token; 
        } catch (error) {
          console.error("Backend auth failed:", error);
        }
      }
      return token;
    },
    async session({ session, token }: any) {  // ✅ include token
      session.user.backendUserId = token.backendUserId as string;
      session.user.isOnboardingNeeded = token.isOnboardingNeeded as boolean;
      session.user.googleAccessToken = token.googleAccessToken as string; 

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
});


export { handler as GET, handler as POST };
// app/api/auth/[...nextauth]/route.ts
import authService from "@/services/auth.service";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
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
    async jwt({ token, account, profile, user, trigger, session }) {
      // Handle Google OAuth
      if (account && account.provider === "google") {
        try {
          const email = profile?.email;
          const name = profile?.name;
          let imageUrl =
            (typeof profile?.image === "string" && profile.image) ||
            (typeof (profile as { picture?: string })?.picture === "string" &&
              (profile as { picture?: string }).picture) ||
            (typeof user?.image === "string" && user.image) ||
            (typeof token?.picture === "string" && token.picture) ||
            "";

          // Validate required fields from Google profile
          if (!email || !name) {
            throw new Error(
              `Missing required Google profile fields: email=${!!email}, name=${!!name}`,
            );
          }

          // Some Google profiles do not expose an avatar; fetch userinfo or create a deterministic fallback.
          if (!imageUrl && typeof account.access_token === "string") {
            try {
              const userInfoResponse = await fetch(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                {
                  headers: {
                    Authorization: `Bearer ${account.access_token}`,
                  },
                  cache: "no-store",
                },
              );
              if (userInfoResponse.ok) {
                const userInfo = (await userInfoResponse.json()) as {
                  picture?: string;
                };
                if (typeof userInfo.picture === "string" && userInfo.picture) {
                  imageUrl = userInfo.picture;
                }
              }
            } catch (avatarError) {
              console.warn(
                "Failed to fetch Google userinfo avatar:",
                avatarError,
              );
            }
          }

          if (!imageUrl) {
            imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`;
          }

          // Build the login payload with required fields
          const loginPayload: Record<string, string> = {
            email,
            name,
            image_url: imageUrl,
          };

          // Try login first; if user does not exist yet, create an OAuth user and retry login.
          let googleResponse;
          try {
            googleResponse = await authService.googleLogin(
              loginPayload as {
                email: string;
                name: string;
                image_url?: string;
              },
            );
          } catch (loginError) {
            const message =
              loginError instanceof Error
                ? loginError.message.toLowerCase()
                : "";
            console.log("Google login first attempt failed:", {
              message,
              error: loginError,
              sentPayload: loginPayload,
            });

            // Check if this is a "user not found" error (404 or specific messages)
            const shouldProvisionOauthUser =
              message.includes("not found") ||
              message.includes("does not exist") ||
              message.includes("no user") ||
              message.includes("not registered") ||
              message.includes("user not found") ||
              message.includes("404");

            if (!shouldProvisionOauthUser) {
              // This is a different error (network, auth, etc.), rethrow it
              console.error(
                "Google login error (not a missing user):",
                message,
              );
              throw loginError;
            }

            // User doesn't exist, provision them
            console.log("Provisioning new Google OAuth user:", { email, name });
            await authService.signup({
              email,
              name,
              nickname: name,
              oauth: true,
              oauth_method: "google",
            });

            // Retry login with same payload
            console.log("Retrying Google login after signup");
            googleResponse = await authService.googleLogin(
              loginPayload as {
                email: string;
                name: string;
                image_url?: string;
              },
            );
          }

          // Store the backend token and user data
          token.backendAccessToken = googleResponse.token;
          token.user = googleResponse.user;
          token.isOnboardingNeeded = !googleResponse.user.account_completed;
          console.log(googleResponse);
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

      if (token.user && typeof token.user === "object") {
        Object.assign(session.user, token.user as Record<string, unknown>);
      }

      session.user.isOnboardingNeeded = token.isOnboardingNeeded as boolean;

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

import { signIn } from "next-auth/react";
import useAuthStore from "@/store/auth.store";

export const handleGoogleSignup = async () => {
  try {
    console.log("Starting Google sign-in");
    const result = await signIn("google", {
      redirect: false,
      callbackUrl: "/auth/signup",
    });

    console.log("Sign-in result:", {
      success: result?.ok,
      error: result?.error,
      url: result?.url
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    sessionStorage.setItem("is_oauth_signup", "true");
    
    // The token should be available in the session after successful sign-in
    console.log("Waiting for session token...");
    const token = await new Promise<string>((resolve) => {
      const checkToken = () => {
        const session = JSON.parse(sessionStorage.getItem('next-auth.session-token') || '{}');
        console.log("Checking session:", session);
        if (session?.accessToken) {
          console.log("Found access token:", session.accessToken);
          resolve(session.accessToken);
        } else {
          setTimeout(checkToken, 100);
        }
      };
      checkToken();
    });

    sessionStorage.setItem("google_oauth_token", token);
    console.log("Stored Google OAuth token in sessionStorage:", token);
    
    // Update current step to 3 since we skip steps 1 and 2 with Google sign-in
    useAuthStore.getState().updateSignupData({ currentStep: 3 });
    console.log("Updated current step to 3 after Google sign-in");
    
    console.log("Google sign-in successful");
  } catch (error) {
    console.error("Google sign-in error:", {
      error: error,
      message: error instanceof Error ? error.message : String(error)
    });
    throw new Error("Failed to sign in with Google");
  }
};

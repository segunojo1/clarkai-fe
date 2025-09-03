// utils/google.ts
import { signIn, signOut } from "next-auth/react";
import useAuthStore from "@/store/auth.store";
import authService from "@/services/auth.service";
import Cookies from "js-cookie";

export const handleGoogleSignIn = async () => {
  try {
    console.log("Starting Google sign-in");
    
    // Clear any existing auth data
    Cookies.remove("token");
    sessionStorage.removeItem("google_oauth_token");
    sessionStorage.removeItem("is_oauth_signup");
    
    // Initiate Google sign-in
    const result = await signIn("google", {
      redirect: false,
      callbackUrl: "/auth/login",
    });

    console.log("Sign-in result:", {
      success: result?.ok,
      error: result?.error,
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    return { success: true };
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw new Error("Failed to sign in with Google");
  }
};

export const handleGoogleLogout = async () => {
  try {
    // Clear all auth-related storage
    Cookies.remove("token");
    sessionStorage.clear();
    localStorage.removeItem("auth-storage");
    
    // Sign out from NextAuth
    await signOut({ redirect: false });
    
    // Redirect to login page
    window.location.href = "/auth/login";
  } catch (error) {
    console.error("Logout error:", error);
  }
};
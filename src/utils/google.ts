import { signIn, useSession } from "next-auth/react";

export const handleGoogleSignup = async () => {
  await signIn("google", { callbackUrl: "/auth/signup" });
};

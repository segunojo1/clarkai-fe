import AuthClientLayout from "@/components/layout/auth-layout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clark Auth",
  description: "Authentication",
};
export default function AuthLayout({ children }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthClientLayout>
        {children}
    </AuthClientLayout>
  )
}
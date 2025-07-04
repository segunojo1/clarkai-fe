import type { Metadata } from "next";
import "../globals.css";
import ClientLayout from "@/components/layout/client-layout";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export const metadata: Metadata = {
  title: "Clark",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
        <ClientLayout>
          {children}
        </ClientLayout>
    </SidebarProvider>
  );
}

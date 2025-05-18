'use client';

import { AppSidebar } from "../app-sidebar";
import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main>

                <SidebarTrigger />
                <div>
                    
                </div>
                {children}
            </main>
        </SidebarProvider>
    )
}
'use client';

import { Edit, File, PlusIcon } from "lucide-react";
import { AppSidebar } from "../app-sidebar";
import { SidebarProvider, SidebarTrigger, useSidebar } from "../ui/sidebar";
import { Button } from "../ui/button";
import authService from "@/services/auth.service";
import { useRouter } from "next/navigation";
import ThemeSwitcher from "../theme-switcher";
import Link from "next/link";
import UserAvatar from "../user-avatar";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) { 
    const {
    open
  } = useSidebar()
    const route = useRouter()
    const logout = () => {
        authService.logout();
        route.push("/auth/login")
    }
    return (
            <main className="w-full relative">
                {!open && (
                <div className="flex items-center gap-1 absolute left-[70px] top-[20px] z-[999999]">
                    <SidebarTrigger />
                    <Link href="/chat">
                        <Edit width={20} height={20} />
                    </Link>
                     
                </div>
                )}
                <div className="flex items-center gap-3 absolute right-[20px] top-[20px]">
                    <PlusIcon width={20} height={20} />
                    <File className="mr-[30px]" width={20} height={20} />
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={logout}
                    >
                        Logout
                    </Button>

                    <ThemeSwitcher />
                </div>
                {children}
            </main>
    )
}
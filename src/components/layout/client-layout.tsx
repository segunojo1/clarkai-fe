'use client';

import { Edit } from "lucide-react";
import { SidebarTrigger, useSidebar } from "../ui/sidebar";
import { Button } from "../ui/button";
import authService from "@/services/auth.service";
import { useRouter, usePathname } from "next/navigation";
import ThemeSwitcher from "../theme-switcher";
import Link from "next/link";
import { useEffect } from "react";
import { useChatStore } from "@/store/chat.store";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) { 
    const {getAllChats, setChats} = useChatStore()
    const {
    open
  } = useSidebar()
    const route = useRouter()
    const pathname = usePathname()
    const isWorkspacePage = pathname.startsWith('/workspaces')
    
    const logout = () => {
        authService.logout();
        route.push("/auth/login")
    }
    useEffect(() => {
        const getChatss = async () => {
            try {
                const answer = await getAllChats(1)
                console.log(answer);
                setChats(answer)
                
            } catch (error) {
                console.error(error);
                
            }
        }
        getChatss()
    }, [])
    return (
            <main className="w-full h-full relative flex-1">
                {!isWorkspacePage && (
                    <>
                        {!open && (
                        <div className="flex items-center gap-1 absolute left-[20px] top-[20px] z-[999999]">
                            <SidebarTrigger />
                            <Link href="/chat">
                                <Edit width={20} height={20} />
                            </Link>
                        </div>
                        )}
                        <div className="flex items-center gap-3 absolute right-[20px] top-[20px] z-10">
                            <Button
                                variant="outline"
                                onClick={logout}
                            >
                                Logout
                            </Button>

                            <ThemeSwitcher />
                        </div>
                    </>
                )}
                {children}
            </main>
    )
}
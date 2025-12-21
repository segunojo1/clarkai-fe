'use client';

import { ChevronDown, Edit, Moon, X } from "lucide-react";
import { SidebarTrigger, useSidebar } from "../ui/sidebar";
import { Button } from "../ui/button";
import authService from "@/services/auth.service";
import { useRouter, usePathname } from "next/navigation";
import ThemeSwitcher from "../theme-switcher";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useChatStore } from "@/store/chat.store";
import { useWorkspaceStore } from "@/store/workspace.store";
import { WorkspaceCreationModal } from "../home/workspace-creation-modal";
import { SubscriptionStatus } from "../subscription/subscription-status";
import { signOut } from "next-auth/react";
import Cookies from "js-cookie";
import { UploadMaterialModal } from "../home/upload-material-modal";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { getAllChats } = useChatStore()
    const { getWorkspaces } = useWorkspaceStore()
    const {
        open
    } = useSidebar()
    const route = useRouter()
    const pathname = usePathname()
    const isWorkspacePage = pathname.startsWith('/workspaces')
    const [isAuth, setIsAuth] = useState(false);

    const logout = async () => {
        await signOut({ redirect: false }); // prevent NextAuth auto-redirect
        sessionStorage.clear()
        authService.logout();
        route.push("/auth/login")
    }
    
    
    useEffect(() => {
        // Auth guard: redirect to login if missing token
        const token = Cookies.get('token');
        console.log("client layout");
        // if (token) {
        //     setIsAuth(true)
        //     console.log("client layout");
        //     return;
        // }
        const initializeData = async () => {
            try {
                await getAllChats(1)
                await getWorkspaces()
            } catch (error) {
                console.error("Failed to initialize data:", error)
            }
        }
        initializeData()
        
    }, [route, getAllChats, getWorkspaces])
    return (
        <main className="w-full h-full relative flex-1">
            {(
                <>
                    {/* {!open && (

                        <div className="flex items-center gap-1 absolute left-[20px] top-[20px] z-[999999]">
                            <SidebarTrigger />
                            <Link href="/chat">
                                <Edit width={20} height={20} />
                            </Link>
                        </div>
                    )} */}
                    <div className=" absolute right-[20px] top-[20px] z-10">
                        {
                            !isWorkspacePage && (
                                <div className="flex items-center gap-3">

                                    {
                                        isAuth && (
                                            <div className="flex items-center gap-3">
                                                <SubscriptionStatus />

                                                <Button
                                                    variant="outline"
                                                    onClick={logout}
                                                    className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                >
                                                    Logout
                                                </Button>
                                            </div>
                                        )
                                    }

                                    <ThemeSwitcher />
                                </div>
                            )
                        }

                        {/* <WorkspaceCreationModal>
                            <Button className="bg-[#FF3D00] hover:bg-[#FF3D00]/90 text-white font-medium px-4 py-2 rounded-md text-sm flex items-center gap-2">
                                <span className="text-lg">+</span>
                                Create
                                <ChevronDown className="w-4 h-4" />
                            </Button>
                        </WorkspaceCreationModal> */}

                    </div>
                </>
            )}
            {children}
        </main>
    )
}
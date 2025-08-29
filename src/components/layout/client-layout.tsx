'use client';

import { ChevronDown, Edit, Moon, X } from "lucide-react";
import { SidebarTrigger, useSidebar } from "../ui/sidebar";
import { Button } from "../ui/button";
import authService from "@/services/auth.service";
import { useRouter, usePathname } from "next/navigation";
import ThemeSwitcher from "../theme-switcher";
import Link from "next/link";
import { useEffect } from "react";
import { useChatStore } from "@/store/chat.store";
import { useWorkspaceStore } from "@/store/workspace.store";
import { WorkspaceCreationModal } from "../home/workspace-creation-modal";

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

    const logout = () => {
        authService.logout();
        route.push("/auth/login")
    }
    useEffect(() => {
        const initializeData = async () => {
            try {
                await getAllChats(1)
                await getWorkspaces()
            } catch (error) {
                console.error("Failed to initialize data:", error)
            }
        }
        initializeData()
    }, [])
    return (
        <main className="w-full h-full relative flex-1">
            {(
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
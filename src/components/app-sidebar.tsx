"use client"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar"
import {
    Card,
    CardContent,
} from "@/components/ui/card"

import { ChevronDown, ChevronRight, Edit, Globe, Home, Inbox, PlusIcon, Search } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "./ui/button"
import { useUserStore } from "@/store/user.store"
import { useChatStore } from "@/store/chat.store"
import { WorkspaceCreationModal } from "./home/workspace-creation-modal"
import { useWorkspaceStore } from "@/store/workspace.store"

export const LatestChat = () => {
    const { chats } = useChatStore();
    const { state } = useSidebar();

    // Show collapsed version when sidebar is collapsed
    if (state === "collapsed") {
        return (
            <div className="flex justify-center">
                <Link href="/chat">
                    <Button size="icon" className="bg-[#F8F8F7] dark:bg-[#2C2C2C] text-[#525252]">
                        <Globe width={20} height={20} />
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div>
            {
                chats.length == 0 ? (
                    <Card className="text-[#525252] dark:text-[#D4D4D4] bg-[#F0F0EF] dark:bg-[#404040] rounded-[10px] !p-[10px] h-[132px] w-[214px] shadow-none mx-auto">
                        <CardContent className=" flex flex-col items-center justify-between px-0 h-full">
                            <Globe width={20} height={20} />
                            <p className=" text-[12px]/[22px] font-medium satoshi text-center">Your latest chats will show up once you start talking to Clark.</p>
                            <Link href="/chat" className="w-full cursor-pointer">
                                <Button className="min-w-full  bg-[#F8F8F7] dark:bg-[#2C2C2C] text-[#525252] text-3 font-semibold">Start a Chat</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="">
                        <h2 className="text-[12px]/[22px] font-bold">Recent Chats</h2>
                        <div className="max-h-[120px] overflow-y-scroll">
                            {chats.map(chat => (
                                <Link key={chat.id} href={`/chat/${chat.id}`} className="p-1 w-full dark:hover:bg-gray-800 hover:bg-gray-300 flex px-[11px]">
                                    <p className="text-[14px] font-medium">{chat.name}</p>
                                </Link>
                            ))}
                        </div>
                        <Button className="w-full text-[14px] font-bold dark:text-white hover:bg-[#F0F0EF] text-black dark:bg-[#404040] bg-[#F0F0EF] mt-1">View all chat</Button>
                    </div>
                )
            }
        </div>
    )
}

export const LatestWorkspace = () => {
    const { workspaces, isLoading } = useWorkspaceStore();
    const { state } = useSidebar();
    const pathname = usePathname()

    if (isLoading) {
        return (
            <Card className="text-[#525252] dark:text-[#D4D4D4] bg-[#F0F0EF] dark:bg-[#404040] rounded-[10px] !p-[10px] h-[132px] w-[214px] shadow-none mx-auto">
                <CardContent className=" flex flex-col items-center justify-between px-0 h-full">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
                </CardContent>
            </Card>
        );
    }

    if (workspaces.length === 0) {
        return (
            <Card className="text-[#525252] dark:text-[#D4D4D4] bg-[#F0F0EF] dark:bg-[#404040] rounded-[10px] !p-[10px] h-[132px] w-[214px] shadow-none mx-auto">
                <CardContent className=" flex flex-col items-center justify-between px-0 h-full">
                    <Globe width={20} height={20} />
                    <p className=" text-[12px]/[22px] font-medium satoshi text-center">Your workspaces will appear here once you create one.</p>
                    <WorkspaceCreationModal>
                        <Button className="min-w-full  bg-[#F8F8F7] dark:bg-[#2C2C2C] text-[#525252] text-3 font-semibold">Start a workspace</Button>
                    </WorkspaceCreationModal>
                </CardContent>
            </Card>
        )
    }

    // Show collapsed version when sidebar is collapsed
    if (state === "collapsed") {
        return (
            <div className="flex justify-center">
                <WorkspaceCreationModal>
                    <Button size="icon" className="bg-[#F8F8F7] dark:bg-[#2C2C2C] text-[#525252]">
                        <Globe width={20} height={20} />
                    </Button>
                </WorkspaceCreationModal>
            </div>
        );
    }

    return (
        <Card className="text-[#525252] dark:text-[#D4D4D4] bg-[#F0F0EF] dark:bg-[#404040] rounded-[10px] !p-[10px] h-[184px] w-[214px] shadow-none mx-auto">
            <CardContent className=" flex flex-col items-center justify-between px-0 h-full">
                <div className="flex flex-col w-full gap-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[14px] font-medium">Workspaces</h2>
                        <div className="flex gap-[10px] ">
                            <WorkspaceCreationModal>
                                <PlusIcon className="w-4 h-4" />
                            </WorkspaceCreationModal>
                            <Link href="/workspaces">
                                <ChevronDown className="h-4 w-4 -rotate-90" />
                            </Link>
                        </div>
                    </div>
                    <div className="flex flex-col overflow-y-scroll gap-1 h-[132px]">
                        {workspaces.map((workspace) => (
                            <Link href={`/workspaces/${workspace.enc_id}`} key={workspace.enc_id} className={`${pathname === workspace.enc_id ? "bg-[#ffffff]" : ""} flex items-center justify-between dark:bg-[#262626] gap-1 px-[10px] py-[5px] rounded-[5px]`}>
                                <div className="flex items-center gap-2">
                                    <Globe width={20} height={20} />
                                    <p className="text-sm font-medium">{workspace.name}</p>
                                </div>
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

interface SidebarItem {
    title: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
}

interface SidebarGroupCustomProps {
    items: SidebarItem[];
    label?: string;
}

const SidebarGroupCustom = ({ items, label }: SidebarGroupCustomProps) => {
    const pathname = usePathname()

    return (
        <SidebarGroup>
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu className="text-[11px]/[22px] font-medium">
                    {items.map(item => (
                        <SidebarMenuItem key={item.title} className={`transition-all duration-200 rounded-[5px] ${pathname === item.url ? 'bg-[#F0F0EF] dark:bg-[#404040]' : 'bg-[#F8F8F7] dark:bg-[#2C2C2C]'
                            }`}>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                isActive={pathname === item.url}
                            >
                                <Link
                                    href={item.url}
                                    className={`pl-5 transition-colors duration-200 rounded-[5px] ${pathname === item.url
                                        ? 'bg-[#F0F0EF] dark:bg-[#404040]'
                                        : 'hover:bg-[#F0F0EF] dark:hover:bg-[#404040]'
                                        }`}>
                                    <item.icon
                                        className={`transition-colors duration-200 ${pathname === item.url
                                            ? 'text-orange-500 dark:text-orange-400'
                                            : 'text-[#525252] dark:text-[#D4D4D4]'
                                            }`}
                                    />
                                    <span
                                        className={`transition-colors duration-200 ${pathname === item.url
                                            ? 'text-orange-500 dark:text-orange-400'
                                            : 'text-[#525252] dark:text-[#D4D4D4]'
                                            }`}>
                                        {item.title}
                                    </span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}

export function AppSidebar() {
    const pathname = usePathname()
    const isWorkspaceDetailPage = pathname?.startsWith('/workspaces/')

    const items = [
        { title: "Search", url: "/search", icon: Search },
        { title: "Home", url: "/home", icon: Home },
        { title: "Chat", url: "/chat", icon: Inbox },
        { title: "Workspaces", url: "/workspaces", icon: Globe },
    ]
    const workspaceItems = [
        { title: "Canvas", url: "/home", icon: Search },
        { title: "Whiteboard", url: "/home", icon: Home },
        { title: "Materials", url: "/home", icon: Inbox },
        { title: "Study Groups", url: "/home", icon: Inbox }
    ]

    const { user } = useUserStore()

    return (
        <Sidebar
            className="dark:bg-[#2c2c2c] bg-[#F8F8F7] transition-none"
            collapsible="icon"
            variant="sidebar"
        >
            <SidebarHeader>
                <SidebarGroup>
                    <SidebarGroupContent className="flex items-center justify-between">
                        <div className="flex items-center gap-[10px] group-data-[collapsible=icon]:justify-center">
                            <Image
                                src={user?.image_url && user.image_url !== "" ? user.image_url : "/assets/orange.png"}
                                alt="user avatar"
                                width={24}
                                height={24}
                                className="rounded-full w-[24px] h-[24px]"
                            />

                            <p className="text-[14px] font-bold group-data-[collapsible=icon]:hidden">{user?.name || 'User'}</p>
                        </div>
                        <div className="flex items-center gap-1 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-2">
                            <SidebarTrigger />
                            <Link href="/chat" className="group-data-[collapsible=icon]:hidden">
                                <Edit width={20} height={20} />
                            </Link>
                        </div>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarHeader>

            <SidebarContent className="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] overflow-y-auto">
                <SidebarGroupCustom items={items} />
                <SidebarGroup className="mx-auto">
                    <LatestChat />
                </SidebarGroup>
                <SidebarGroup className="mx-auto">
                    <LatestWorkspace />
                </SidebarGroup>
                {/* <SidebarGroupCustom items={workspaceItems} label="Workspace Hub" /> */}
            </SidebarContent>

            <SidebarRail />
        </Sidebar>
    )
}
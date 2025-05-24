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
    SidebarTrigger,
} from "@/components/ui/sidebar"
import {
    Card,
    CardContent,
} from "@/components/ui/card"

import {Globe, Home, Inbox, Search } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "./ui/button"
import { useUserStore } from "@/store/user.store"

export const LatestChat = () => {
    return (
        <Card className="text-[#525252] dark:text-[#D4D4D4] bg-[#F0F0EF] dark:bg-[#404040] rounded-[10px] !p-[10px] h-[132px] w-[214px] shadow-none mx-auto">
            <CardContent className=" flex flex-col items-center justify-between px-0 h-full">
                <Globe width={20} height={20}/>
                <p className=" text-[12px]/[22px] font-medium satoshi text-center">Your latest chats will show up once you start talking to Clark.</p>
            <Button className="min-w-full  bg-[#F8F8F7] dark:bg-[#2C2C2C] text-[#525252] text-3 font-semibold">Start a Chat</Button>
            </CardContent>
        </Card>

    )
}

export const LatestWorkspace = () => {
    return (
        <Card className="text-[#525252] dark:text-[#D4D4D4] bg-[#F0F0EF] dark:bg-[#404040] rounded-[10px] !p-[10px] h-[132px] w-[214px] shadow-none mx-auto">
            <CardContent className=" flex flex-col items-center justify-between px-0 h-full">
                <Globe width={20} height={20}/>
                <p className=" text-[12px]/[22px] font-medium satoshi text-center">Your workspaces will appear here once you create one.</p>
            <Button className="min-w-full  bg-[#F8F8F7] dark:bg-[#2C2C2C] text-[#525252] text-3 font-semibold">Start a workspace</Button>
            </CardContent>
        </Card>
    )
}

const SidebarGroupCustom = ({items, label}: any) => {
    const pathname = usePathname()

    return (
        <SidebarGroup>
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="text-[11px]/[22px] font-medium">
                            {items.map(item => (
                                <SidebarMenuItem key={item.title} className={`transition-all duration-200 ${
                                    pathname === item.url ? 'bg-[#F0F0EF] dark:bg-[#404040]' : ''
                                }`}>
                                    <SidebarMenuButton asChild>
                                        <Link 
                                            href={item.url} 
                                            className={`pl-5 transition-colors duration-200 ${
                                                pathname === item.url 
                                                    ? 'bg-[#F0F0EF] dark:bg-[#404040]' 
                                                    : 'hover:bg-[#F0F0EF] dark:hover:bg-[#404040]'
                                            }`}>
                                            <item.icon 
                                                className={`transition-colors duration-200 ${
                                                    pathname === item.url 
                                                        ? 'text-orange-500 dark:text-orange-400' 
                                                        : 'text-[#525252] dark:text-[#D4D4D4]'
                                                }`} 
                                            />
                                            <span 
                                                className={`transition-colors duration-200 ${
                                                    pathname === item.url 
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
    const items = [
        {title: "Search", url: "/search", icon: Search},
        {title: "Home", url: "/home", icon: Home },
        {title: "Inbox", url: "/home", icon: Inbox},
        {title: "Chat", url: "/chat", icon: Inbox}
    ]
    const workspaceItems = [
        {title: "Canvas", url: "/home", icon: Search},
        {title: "Whiteboard", url: "/home", icon: Home },
        {title: "Materials", url: "/home", icon: Inbox},
        {title: "Study Groups", url: "/home", icon: Inbox}
    ]
    
    const { user } = useUserStore();
    return (
        <Sidebar className="max-w-[235px] sidebar">
            <SidebarHeader>
                <SidebarGroup>
                    <SidebarGroupContent className="flex items-center justify-between">
                        <div className="flex items-center gap-[10px]">
                        <Image src="/assets/orange.png" alt="" width={24} height={24} />
                        <p className="text-[14px] font-bold">{user?.name || 'User'}</p>
                        </div>
                        <SidebarTrigger />
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroupCustom items={items} />

                <SidebarGroup className="mx-auto">
                    <LatestChat />
                </SidebarGroup>
                <SidebarGroup className="mx-auto">
                    <LatestWorkspace />
                </SidebarGroup>
                <SidebarGroupCustom items={workspaceItems} label="Workspace Hub" />

            </SidebarContent>

            {/* <SidebarFooter>
                <SidebarGroup>
                    <SidebarGroupContent className="">
                        <SidebarMenu className="space-y-[9px]">
                            <SidebarMenuItem className="flex items-center justify-between">
                                <SidebarMenuButton asChild className="pl-5 py-[10px] px-[9px] bg-white rounded-[6px]">
                                    <Link href="" className="">
                                        <Image src="/assets/plus.png" alt="" width={18} height={18} />
                                        <span className="text-[11px]/[23px] font-medium">Start New Chat</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem className="flex items-center justify-between">
                                <SidebarMenuButton asChild className="pl-5 py-[10px] px-[9px] bg-white rounded-[6px]">
                                    <Link href="" className="">
                                        <Image src="/assets/plus.png" alt="" width={18} height={18} />
                                        <span className="text-[13px]/[28px] font-medium">Start New Session</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarSeparator />
                            <SidebarMenuItem className="flex items-center justify-between">

                                <LogOut size={24} />
                                <Settings size={24} />
                                <Image src="/assets/orange.png" alt="" width={26} height={26} />
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarFooter> */}
        </Sidebar>
    )
}

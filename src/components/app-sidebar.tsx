import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from "@/components/ui/sidebar"
import { File, Home, LogOut, SeparatorVertical, Settings, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function AppSidebar() {
    const items = [
        {
            title: "Home",
            url: "/home",
            icon: Home
        },
        {
            title: "Canvas",
            url: "/home",
            icon: Home
        },
        {
            title: "Whiteboard",
            url: "/home",
            icon: Users
        },
        {
            title: "Groups",
            url: "/home",
            icon: Home
        },
        {
            title: "Materials",
            url: "/home",
            icon: File
        },
    ]
    return (
        <Sidebar>
            <SidebarHeader />
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Items</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="text-[11px]/[22px] font-medium">
                            {items.map(item => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url} className="pl-5">
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup />
            </SidebarContent>
            <SidebarFooter>
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
            </SidebarFooter>
        </Sidebar>
    )
}

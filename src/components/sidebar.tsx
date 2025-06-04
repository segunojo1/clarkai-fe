import { CircuitBoard, File, Home, LayoutPanelLeft, PlusIcon, Users, UsersRound } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React from "react"

const SideBar = () => {
  return (
    <aside className="bg-[#F2F2F2] py-[30px] px-[17px] max-w-[206px] w-full flex flex-col items-center gap-5 ">
        <div className="flex items-center justify-between">
            <LayoutPanelLeft />
            <PlusIcon />
        </div>
        <Image src="/assets/clark-log.png" alt="clark logo" />
        {SideBarItems.map(items => <SidebarItem key={items.text} {...items}/>)}
    </aside>
  )
}

export default SideBar

const SideBarItems = [
    {icon: <Home />, text: "Home", href: "/home" },
    {icon: <CircuitBoard />, text: "Canvas", href: "/home"},
    {icon: <Users />, text: "Whiteboard", href: "/home"},
    {icon: <UsersRound />, text: "Groups", href: "/home"},
    {icon: <File />, text: "Materials", href: "/home"}
]

interface SidebarProp {
    href: string;
    icon: React.ReactNode;
    text: string
}

export const SidebarItem = ({href, icon, text}: SidebarProp) => {
    const pathname = usePathname();
    const isActive = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
            href={href}
            className={`flex items-center w-fit justify-between px-4 py-2 text-sm text-black rounded-md transition-colors ${
                isActive 
                    ? 'bg-[#ffffff] text-[#F14E07] font-medium' 
                    : 'hover:bg-gray-100'
            }`}
        >
            <div className="flex items-center gap-3">
                <div className={isActive ? 'text-[#F14E07]' : 'text-gray-600'}>
                    {icon}
                </div>
                <span className={isActive ? 'text-[#F14E07] text-[11px]/[22px] font-medium' : 'text-gray-600'}>{text}</span>
            </div>
        </Link>
  )
}

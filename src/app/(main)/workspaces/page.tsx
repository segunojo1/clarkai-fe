"use client"

import { Button } from "@/components/ui/button"
import { ChevronDown, Globe, Star, X, Moon, Trash } from "lucide-react"
import { WorkspaceCreationModal } from "@/components/home/workspace-creation-modal"
import { useWorkspaceStore } from "@/store/workspace.store"
import Image from "next/image"
import { useState, useEffect } from "react"
import Link from "next/link"
import ThemeSwitcher from "@/components/theme-switcher"
import authService from "@/services/auth.service"
import { useRouter } from "next/navigation"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DialogTrigger } from "@radix-ui/react-dialog"
import workspaceService from "@/services/workspace.service"
import { toast } from "sonner"
// import { UploadMaterialModal } from "@/components/home/upload-material-modal"

type WorkspaceDeleteDialogProps = { workspaceId: string }

const WorkspaceDeleteDialog = ({ workspaceId }: WorkspaceDeleteDialogProps) => {
  const [open, setOpen] = useState(false)

  const handleDelete = async () => {
    try {
      await workspaceService.deleteWorkspace(workspaceId)
      toast.success("Workspace deleted successfully")
      useWorkspaceStore.getState().getWorkspaces()
    } catch (error) {
      toast.error("Error deleting workspace")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Trash
          className="absolute top-4 left-4 w-4 h-4 text-gray-400 hover:text-yellow-400 cursor-pointer transition-colors group-hover:block hidden"
          onClick={(e) => {
            e.preventDefault()
            setOpen(true)
          }}
        />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Workspace</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this workspace?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const WorkspacesPage = () => {
    // const router = useRouter()
    const [activeTab, setActiveTab] = useState("Recently Viewed")
    const { workspaces } = useWorkspaceStore();
    const route = useRouter();


    const logout = () => {
        authService.logout();
        route.push("/auth/login")
    }

    useEffect(() => {
        // Fetch workspaces when component mounts
        useWorkspaceStore.getState().getWorkspaces()
    }, [])

    return (
        <div className="flex flex-col h-full w-full dark:bg-[#1a1a1a] bg-[#FAFAFA] text-white !max-w-[calc(100vw)]">
            {/* Top Header */}
            <div className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-gray-400" />
                    <button className="flex items-center gap-2 text-white font-medium">
                        Workspaces
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <WorkspaceCreationModal>
                        <Button className="bg-[#FF3D00] hover:bg-[#FF3D00]/90 text-white font-medium px-4 py-2 rounded-md text-sm flex items-center gap-2">
                            <span className="text-lg">+</span>
                            Create
                            <ChevronDown className="w-4 h-4" />
                        </Button>
                    </WorkspaceCreationModal>
                    {/* <UploadMaterialModal >
                                            <button className="p-2 hover:bg-gray-700 rounded-md transition-colors">
                                                <Image 
                                                    src="/globe.svg" 
                                                    alt="Globe" 
                                                    width={20} 
                                                    height={20}
                                                    className="w-5 h-5"
                                                />
                                            </button>
                                        </UploadMaterialModal> */}
                    <Button
                        variant="outline" className="text-black dark:text-white"
                        onClick={logout}
                    >
                        Logout
                    </Button>

                    <ThemeSwitcher />
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center justify-between px-6 py-4 ">
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => setActiveTab("Recently Viewed")}
                        className={`font-medium text-sm transition-colors ${activeTab === "Recently Viewed"
                            ? "dark:text-white text-black bg-[#F0F0EF] dark:bg-[#404040] p-1 rounded-[4px]"
                            : "text-gray-400 dark:hover:text-white hover:text-black"
                            }`}
                    >
                        Recently Viewed
                    </button>
                    <button
                        onClick={() => setActiveTab("Shared")}
                        className={`font-medium text-sm transition-colors ${activeTab === "Shared"
                            ? "dark:text-white text-black bg-[#F0F0EF] dark:bg-[#404040] p-1 rounded-[4px]"
                            : "text-gray-400 dark:hover:text-white hover:text-black"
                            }`}
                    >
                        Shared
                    </button>
                    <button
                        onClick={() => setActiveTab("Starred")}
                        className={`font-medium text-sm transition-colors ${activeTab === "Starred"
                            ? "dark:text-white text-black bg-[#F0F0EF] dark:bg-[#404040] p-1 rounded-[4px]"
                            : "text-gray-400 dark:hover:text-white hover:text-black"
                            }`}
                    >
                        Starred
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">Sort by:</span>
                    <button className="flex items-center gap-1 text-white text-sm hover:text-gray-300 transition-colors">
                        <ChevronDown className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            {workspaces.length === 0 ? (
                <div className="flex flex-1">
                    {/* Left Sidebar - Workspace Card */}
                    <div className="w-64 p-6">
                        <div className="dark:bg-[#2a2a2a] bg-[#F0F0EF] rounded-lg p-6  relative">
                            
                            {/* Star icon in top right */}
                            <Star className="absolute top-4 right-4 w-4 h-4 text-gray-400 hover:text-yellow-400 cursor-pointer transition-colors" />
                            {/* File icon using file.png */}
                            <div className="flex justify-center mb-8 mt-4">
                                <Image
                                    src="/assets/file.png"
                                    alt="File icon"
                                    width={160}
                                    height={120}
                                    className="w-40 h-32 dark:block hidden"
                                />
                                <Image
                                    src="/assets/file-outline.png"
                                    alt="File icon"
                                    width={160}
                                    height={120}
                                    className="w-40 h-32 dark:hidden block"
                                />
                            </div>

                            {/* Text */}
                            <div className="text-center">
                                <p className="dark:text-gray-300 text-[#A3A3A3] text-sm">Your workspace goes here</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Main Content Area */}
                    <div className="flex-1 flex flex-col items-start justify-center text-center px-8 pl-16">
                        <div className="max-w-[600px]">
                            {/* Main heading with globe icon */}
                            <h1 className="text-[40px] font-bold satoshi dark:text-gray-300 text-[#737373] mb-6 flex items-center justify-center gap-3">
                                Looks a little quiet in here...
                                <Globe className="w-8 h-8 text-[#FF3D00] dark:text-gray-400" />
                            </h1>

                            {/* Description */}
                            <p className="text-gray-400 text-base leading-relaxed mb-8 max-w-lg">
                                Workspaces help you organize everything you&apos;re learning—
                                from subjects to side projects—into custom spaces built for
                                deep focus, collaboration, and creativity.
                            </p>

                            {/* Create Workspace Button */}
                            <WorkspaceCreationModal>
                                <Button className="bg-[#FF3D00] hover:bg-[#FF3D00]/90 text-white font-medium px-8 py-3 rounded-md transition-colors">
                                    Create Workspace
                                </Button>
                            </WorkspaceCreationModal>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-1">
                    {/* Left Sidebar - Workspace List */}
                    <div className="w-full p-6">
                        <div className="space-y-4 flex items-start flex-wrap">
                            {workspaces.map((workspace) => (
                                <Link href={`/workspaces/${workspace.enc_id}`} className="" key={workspace.enc_id}>
                                    <div className="dark:hover:bg-[#2C2C2C] hover:bg-[#F0F0EF] rounded-[14.6px] p-6 ">

                                        <div className="group flex justify-center  mb-[19.44px] relative">
                                            <Star className="absolute top-2 right-[13px] w-4 h-4 text-gray-400 hover:text-yellow-400 cursor-pointer transition-colors" />
                                            <WorkspaceDeleteDialog workspaceId={workspace.enc_id} />
                                            <Image
                                                src="/assets/file.png"
                                                alt="File icon"
                                                width={172}
                                                height={138}
                                                className="w-40 h-32"
                                            />
                                            <Globe className="absolute left-[9.7px] bottom-[9.9px] w-[19px] h-[19px]" color={workspace.tag ? workspace.tag : "#99a1af"} />
                                        </div>

                                        <div className="flex flex-col items-center">
                                            <h3 className="dark:text-gray-300 text-black font-medium text-lg">{workspace.name}</h3>
                                            {workspace.description && (
                                                <p className="dark:text-gray-400 text-black text-sm mt-1">{workspace.description}</p>
                                            )}
                                        </div>
                                    </div>
                                </Link>

                            ))}
                        </div>
                    </div>

                </div>
            )}
        </div>
    )
}

export default WorkspacesPage
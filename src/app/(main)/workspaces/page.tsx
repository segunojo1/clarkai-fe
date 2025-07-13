"use client"

import { Button } from "@/components/ui/button"
import { ChevronDown, Globe, Star, X, Moon, PlusIcon, File, FileText } from "lucide-react"
import { WorkspaceCreationModal } from "@/components/home/workspace-creation-modal"
import { useWorkspaceStore } from "@/store/workspace.store"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { UploadMaterialModal } from "@/components/home/upload-material-modal"

const WorkspacesPage = () => {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("Recently Viewed")
    const { workspaces, isLoading, error } = useWorkspaceStore()

    useEffect(() => {
        // Fetch workspaces when component mounts
        useWorkspaceStore.getState().getWorkspaces()
    }, [workspaces])

    return (
        <div className="flex flex-col h-full bg-[#1a1a1a] text-white">
            {/* Top Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-[#333]">
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
                    <UploadMaterialModal>
                        <button className="p-2 hover:bg-gray-700 rounded-md transition-colors">
                            <Image 
                                src="/globe.svg" 
                                alt="Globe" 
                                width={20} 
                                height={20}
                                className="w-5 h-5"
                            />
                        </button>
                    </UploadMaterialModal>
                    <Moon className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white transition-colors" />
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#333]">
                <div className="flex items-center gap-8">
                    <button 
                        onClick={() => setActiveTab("Recently Viewed")}
                        className={`font-medium text-sm transition-colors ${
                            activeTab === "Recently Viewed" 
                                ? "text-white border-b-2 border-white pb-1" 
                                : "text-gray-400 hover:text-white"
                        }`}
                    >
                        Recently Viewed
                    </button>
                    <button 
                        onClick={() => setActiveTab("Shared")}
                        className={`font-medium text-sm transition-colors ${
                            activeTab === "Shared" 
                                ? "text-white border-b-2 border-white pb-1" 
                                : "text-gray-400 hover:text-white"
                        }`}
                    >
                        Shared
                    </button>
                    <button 
                        onClick={() => setActiveTab("Starred")}
                        className={`font-medium text-sm transition-colors ${
                            activeTab === "Starred" 
                                ? "text-white border-b-2 border-white pb-1" 
                                : "text-gray-400 hover:text-white"
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
                        <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#444] relative">
                            {/* Star icon in top right */}
                            <Star className="absolute top-4 right-4 w-4 h-4 text-gray-400 hover:text-yellow-400 cursor-pointer transition-colors" />
                            
                            {/* File icon using file.png */}
                            <div className="flex justify-center mb-8 mt-4">
                                <Image 
                                    src="/assets/file.png" 
                                    alt="File icon" 
                                    width={160} 
                                    height={120}
                                    className="w-40 h-32"
                                />
                            </div>
                            
                            {/* Text */}
                            <div className="text-center">
                                <p className="text-gray-300 text-sm">Your workspace goes here</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Main Content Area */}
                    <div className="flex-1 flex flex-col items-start justify-center text-center px-8 pl-16">
                        <div className="max-w-md">
                            {/* Main heading with globe icon */}
                            <h1 className="text-3xl font-normal text-gray-300 mb-6 flex items-center justify-center gap-3">
                                Looks a little quiet in here...
                                <Globe className="w-8 h-8 text-gray-400" />
                            </h1>
                            
                            {/* Description */}
                            <p className="text-gray-400 text-base leading-relaxed mb-8 max-w-lg">
                                Workspaces help you organize everything you're learning—
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
                        <div className="space-y-4 flex  justify-between flex-wrap">
                            {workspaces.map((workspace) => (
                                <Link href={`/workspaces/${workspace.enc_id}`} className="w-64 p-6" key={workspace.enc_id}>
                                    <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#444] relative">
                                        {/* Star icon in top right */}
                                        <Star className="absolute top-4 right-4 w-4 h-4 text-gray-400 hover:text-yellow-400 cursor-pointer transition-colors" />

                                        {/* File icon using file.png */}
                                        <div className="flex justify-center mb-8 mt-4">
                                            <Image
                                                src="/assets/file.png"
                                                alt="File icon"
                                                width={160}
                                                height={120}
                                                className="w-40 h-32"
                                            />
                                        </div>

                                        <div>
                                            <h3 className="text-gray-300 font-medium text-lg">{workspace.name}</h3>
                                            {workspace.description && (
                                                <p className="text-gray-400 text-sm mt-1">{workspace.description}</p>
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
"use client"

import { Button } from "@/components/ui/button"
import { ChevronDown, Globe, Star, X, Moon, PlusIcon, File, FileText } from "lucide-react"
import { WorkspaceCreationModal } from "@/components/home/workspace-creation-modal"
import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import workspaceServiceInstance from "@/services/workspace.service"

interface Workspace {
    enc_id: string
    name: string
    description?: string
    materials?: { id: string | number; name: string }[]
    quizzes?: { id: string | number; name: string }[]
    notes?: { id: string | number; name: string }[]
    sessions?: { id: string | number; name: string }[]
    canvas?: { id: string | number; name: string }[]
}

const WorkspacesPage = () => {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("Recently Viewed")
    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchWorkspaces = async () => {
            try {
                setIsLoading(true)
                const data = await workspaceServiceInstance.getWorkspaces()
                setWorkspaces(data)
            } catch (err) {
                console.error(err)
                setError("Failed to load workspaces")
            } finally {
                setIsLoading(false)
            }
        }

        fetchWorkspaces()
    }, [])
    return (
            <div className="flex flex-col h-full bg-[#1a1a1a] text-white w-full">
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
                        <Moon className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white transition-colors" />
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#333]">
                    <div className="flex items-center gap-8">
                        <button
                            onClick={() => setActiveTab("Recently Viewed")}
                            className={`font-medium text-sm transition-colors ${activeTab === "Recently Viewed"
                                    ? "text-white border-b-2 border-white pb-1"
                                    : "text-gray-400 hover:text-white"
                                }`}
                        >
                            Recently Viewed
                        </button>
                        <button
                            onClick={() => setActiveTab("Shared")}
                            className={`font-medium text-sm transition-colors ${activeTab === "Shared"
                                    ? "text-white border-b-2 border-white pb-1"
                                    : "text-gray-400 hover:text-white"
                                }`}
                        >
                            Shared
                        </button>
                        <button
                            onClick={() => setActiveTab("Starred")}
                            className={`font-medium text-sm transition-colors ${activeTab === "Starred"
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
                        <div className="w-64 p-6">
                            <div className="space-y-4">
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


import React from 'react'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export const WorkspaceSidebar = ({ workspaces, isLoading, error }: { workspaces: Workspace[], isLoading: boolean, error: string | null }) => {

    return (
        <div className="w-64 bg-gray-100 dark:bg-[#2c2c2c] pt-16 p-4">
            <Tabs defaultValue="folders" className="w-full">
                <TabsList className="w-full">
                    <TabsTrigger value="folders">Folders</TabsTrigger>
                    <TabsTrigger value="tags">Tags</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="flex items-center justify-between mt-5">
                <p className="font-medium">Workspaces</p>
                <PlusIcon width={12} height={12} />
            </div>

            <div className="mt-4 space-y-1">
                {isLoading ? (
                    <div className="text-sm text-gray-500">Loading...</div>
                ) : error ? (
                    <div className="text-red-500 text-sm">{error}</div>
                ) : (
                    workspaces.map((workspace) => (
                        <WorkspaceItem key={workspace.enc_id} workspace={workspace} />
                    ))
                )}
            </div>
        </div>
    )
}

const WorkspaceItem = ({ workspace }: { workspace: Workspace }) => {
    const [expanded, setExpanded] = useState(false)

    return (
        <div className="space-y-2">
            <div
                onClick={() => setExpanded(!expanded)}
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-[#262626] bg-[#262626] p-2 rounded-[5px]"
            >
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                        <Globe width={19} height={19} color="#9747FF" />
                        {workspace.name}
                    </div>
                    <ChevronDown className="w-4 h-4 ml-2" />
                </div>
            </div>

            {expanded && (
                <div className="relative pl-6">
                    <div className="absolute left-3 top-0 h-full w-px bg-gray-200 dark:bg-[#E5E5E5]" aria-hidden="true" />

                    {/* Materials */}
                    <div className="space-y-1 relative">
                        <div className="pl-2 flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            Materials
                        </div>
                        {(workspace.materials || []).map((material) => (
                            <div key={material.id} className="relative pl-6 flex items-center gap-2">
                                <div className="absolute left-3 top-0 h-full w-px text-[13px] bg-gray-200 dark:bg-[#E5E5E5]" />
                                <File color="#D4D4D4" fill="#D4D4D4" height={12} width={9.6} />
                                <div>{material.name}</div>
                            </div>
                        ))}
                    </div>

                    {/* Quizzes */}
                    <div className="space-y-1 relative mt-3">
                        <div className="pl-2 flex items-center">
                            <File className="w-4 h-4 mr-2" />
                            Quizzes
                        </div>
                        {(workspace.quizzes || []).map((quiz) => (
                            <div key={quiz.id} className="relative pl-6">
                                <div className="absolute left-3 top-0 h-full w-px bg-gray-200 dark:bg-gray-700" />
                                <div>{quiz.name}</div>
                            </div>
                        ))}
                    </div>

                    {/* Notes */}
                    <div className="space-y-1 relative mt-3">
                        <div className="pl-2 flex items-center">
                            <File className="w-4 h-4 mr-2" />
                            Notes
                        </div>
                        {(workspace.notes || []).map((note) => (
                            <div key={note.id} className="relative pl-6">
                                <div className="absolute left-3 top-0 h-full w-px bg-gray-200 dark:bg-[#E5E5E5]" />
                                <div>{note.name}</div>
                            </div>
                        ))}
                    </div>

                    {/* Sessions */}
                    <div className="space-y-1 relative mt-3">
                        <div className="pl-2 flex items-center">
                            <File className="w-4 h-4 mr-2" />
                            Sessions
                        </div>
                        {(workspace.sessions || []).map((session) => (
                            <div key={session.id} className="relative pl-6">
                                <div className="absolute left-3 top-0 h-full w-px bg-gray-200 dark:bg-[#E5E5E5]" />
                                <div>{session.name}</div>
                            </div>
                        ))}
                    </div>

                    {/* Canvas */}
                    <div className="space-y-1 relative mt-3">
                        <div className="pl-2 flex items-center">
                            <File className="w-4 h-4 mr-2" />
                            Canvas
                        </div>
                        {(workspace.canvas || []).map((canvas) => (
                            <div key={canvas.id} className="relative pl-6">
                                <div className="absolute left-3 top-0 h-full w-px bg-gray-200 dark:bg-[#E5E5E5]" />
                                <div>{canvas.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

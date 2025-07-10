"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Folder, Tag, FileText, Book, Video, File, ArrowDown, ChevronDown, Globe, PlusIcon } from "lucide-react"
import Image from "next/image";
import { useState } from 'react';

const mockWorkspaces = [
    {
        id: 1,
        name: "Mathematics",
        materials: [
            { id: 1, name: "Algebra.pdf" },
            { id: 2, name: "Geometry.pdf" },
            { id: 3, name: "Calculus.pdf" }
        ],
        quizzes: [
            { id: 1, name: "Algebra Quiz" },
            { id: 2, name: "Geometry Quiz" }
        ],
        notes: [
            { id: 1, name: "Algebra Notes" },
            { id: 2, name: "Calculus Notes" }
        ],
        sessions: [
            { id: 1, name: "Algebra Session" },
            { id: 2, name: "Calculus Session" }
        ],
        canvas: [
            { id: 1, name: "Algebra Canvas" },
            { id: 2, name: "Calculus Canvas" }
        ]
    },
    {
        id: 2,
        name: "Science",
        materials: [
            { id: 1, name: "Physics.pdf" },
            { id: 2, name: "Chemistry.pdf" },
            { id: 3, name: "Biology.pdf" }
        ],
        quizzes: [
            { id: 1, name: "Physics Quiz" },
            { id: 2, name: "Chemistry Quiz" }
        ],
        notes: [
            { id: 1, name: "Physics Notes" },
            { id: 2, name: "Chemistry Notes" }
        ],
        sessions: [
            { id: 1, name: "Physics Session" },
            { id: 2, name: "Chemistry Session" }
        ],
        canvas: [
            { id: 1, name: "Physics Canvas" },
            { id: 2, name: "Chemistry Canvas" }
        ]
    }
]

const WorkspaceItem = ({ workspace }: { workspace: any }) => {
    const [expanded, setExpanded] = useState(false)

    return (
        <div className="space-y-2 ">
            {/* Workspace header */}
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

            {/* Expanded content with indentation lines */}
            {expanded && (
                <div className="relative pl-6"> {/* Increased padding for the guide */}
                    {/* Left border acting as indentation guide */}
                    <div
                        className="absolute left-3 top-0 h-full w-px bg-gray-200 dark:bg-[#E5E5E5]"
                        aria-hidden="true"
                    />

                    {/* Materials section */}
                    <div className="space-y-1 relative">
                        <div className="pl-2 flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            Materials
                        </div>
                        {workspace.materials.map((material) => (
                            <div key={material.id} className="relative pl-6 flex items-center gap-2">

                                <div className="absolute left-3 top-0 h-full w-px text-[13px] bg-gray-200 dark:bg-[#E5E5E5]" />
                                <File color="#D4D4D4" fill="#D4D4D4" height={12} width={9.6} /> <div>{material.name}</div>
                            </div>
                        ))}
                    </div>

                    {/* Repeat same pattern for other sections */}
                    <div className="space-y-1 relative">
                        <div className="pl-2 flex items-center">
                            <File className="w-4 h-4 mr-2" />
                            Quizzes
                        </div>
                        {workspace.quizzes.map((quiz) => (
                            <div key={quiz.id} className="relative pl-6">
                                <div className="absolute left-3 top-0 h-full w-px bg-gray-200 dark:bg-gray-700" />
                                <div>{quiz.name}</div>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-1 relative">
                        <div className="pl-2 flex items-center">
                            <File className="w-4 h-4 mr-2" />
                            Notes
                        </div>
                        {workspace.notes.map((note) => (
                            <div key={note.id} className="relative pl-6">
                                <div className="absolute left-3 top-0 h-full w-px bg-gray-200 dark:bg-[#E5E5E5]" />
                                <div>{note.name}</div>
                            </div>
                        ))}
                    </div>

                    {/* Notes, Sessions, Canvas would follow the same pattern */}
                </div>
            )}
        </div>
    )
}

const Workspaces = () => {
    return (
        <div className="flex h-screen">
            <div className="w-64 bg-gray-100 dark:bg-[#2c2c2c] pt-16 p-4">
                <Tabs defaultValue="folders" className="w-full">
                    <TabsList className="w-full">
                        <TabsTrigger value="folders">
                            Folders
                        </TabsTrigger>
                        <TabsTrigger value="tags">
                            Tags
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="flex items-center justify-between mt-5">
                    <p className="font-medium">Workspaces</p>
                    <PlusIcon width={12} height={12} />
                </div>
                <div className="mt-4 space-y-1">
                    {mockWorkspaces.map((workspace) => (
                        <WorkspaceItem key={workspace.id} workspace={workspace} />
                    ))}
                </div>
            </div>
            <div className="flex-1">
                {/* Main content area */}
                <div className="p-4">
                    <h1 className="text-[14px] font-bold mb-4">Workspaces</h1>


                    <div className="flex items-center  flex-wrap">
                        {mockWorkspaces.map((workspace) => (
                            <div className="flex flex-col items-center p-6 gap-4 hover:bg-[#2C2C2C] rounded-[14px]">
                                <Image key={workspace.id} src="/assets/file.png" alt={workspace.name} width={172} height={138} />
                                <div className="flex flex-col gap-1 text-center">
                                    <h2 className="text-[15px] font-bold">{workspace.name}</h2>
                                    <p>{workspace.materials.length} Materials</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Workspaces
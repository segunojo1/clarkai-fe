"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, Globe, Star, Link, FileText, Scan } from "lucide-react"
import Image from "next/image"

const WorkspacePage = () => {
    const [activeTab, setActiveTab] = useState("Materials")

    return (
        <div className="flex flex-col h-full bg-[#1a1a1a] text-white">
            {/* Top Navigation Tabs */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#333]">
                <div className="flex items-center gap-8">
                    <button 
                        onClick={() => setActiveTab("Materials")}
                        className={`font-medium text-sm transition-colors flex items-center gap-1 ${
                            activeTab === "Materials" 
                                ? "text-white" 
                                : "text-gray-400 hover:text-white"
                        }`}
                    >
                        Materials
                        <ChevronDown className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setActiveTab("Canvas")}
                        className={`font-medium text-sm transition-colors ${
                            activeTab === "Canvas" 
                                ? "text-white" 
                                : "text-gray-400 hover:text-white"
                        }`}
                    >
                        Canvas
                    </button>
                    <button 
                        onClick={() => setActiveTab("Quizzes")}
                        className={`font-medium text-sm transition-colors ${
                            activeTab === "Quizzes" 
                                ? "text-white" 
                                : "text-gray-400 hover:text-white"
                        }`}
                    >
                        Quizzes
                    </button>
                    <button 
                        onClick={() => setActiveTab("Courses")}
                        className={`font-medium text-sm transition-colors ${
                            activeTab === "Courses" 
                                ? "text-white" 
                                : "text-gray-400 hover:text-white"
                        }`}
                    >
                        Courses
                    </button>
                </div>
                
                <div className="flex items-center gap-4">
                    <Button className="bg-transparent border-none text-white font-bold text-xl p-0 hover:bg-gray-700 w-8 h-8">
                        +
                    </Button>
                    <Button className="bg-transparent border-none text-white p-0 hover:bg-gray-700 w-8 h-8">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18l6-6-6-6"/>
                            <path d="M9 18l6-6-6-6"/>
                        </svg>
                    </Button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-8 px-6 py-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                    <span className="font-medium">0</span>
                    <span>Mat. Uploaded</span>
                </div>
                <div className="flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    <span className="font-medium">0</span>
                    <span>links</span>
                </div>
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium">0</span>
                    <span>Docs</span>
                </div>
                <div className="flex items-center gap-2">
                    <Scan className="w-4 h-4" />
                    <span className="font-medium">0</span>
                    <span>Scans</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1">
                {/* Left Sidebar - Material Card */}
                <div className="w-64 p-6">
                    <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#444] relative">
                        {/* Star icon in top right */}
                        <Star className="absolute top-4 right-4 w-4 h-4 text-gray-400 hover:text-yellow-400 cursor-pointer transition-colors" />
                        
                        {/* File icon */}
                        <div className="flex justify-center mb-8 mt-4">
                            <Image 
                                src="/assets/file.png" 
                                alt="File icon" 
                                width={80} 
                                height={80}
                                className="w-20 h-20"
                            />
                        </div>
                        
                        {/* Text */}
                        <div className="text-center">
                            <p className="text-gray-300 text-sm">Your Material goes here</p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Upload Content */}
                <div className="flex-1 flex flex-col justify-center px-8 pl-16">
                    <div className="max-w-lg">
                        {/* Main heading with globe icon */}
                        <h1 className="text-3xl font-normal text-white mb-8 flex items-center gap-3">
                            Upload your First Material
                            <Globe className="w-8 h-8 text-gray-400" />
                        </h1>
                        
                        {/* Content */}
                        <div className="space-y-6 text-base text-gray-300 leading-relaxed mb-8">
                            <p>
                                Upload PDFs, videos, or notes to start building your learning flow.
                            </p>
                            
                            <p>
                                We help you organize every material you add—so everything stays structured, easy to access, and focused on what matters.
                            </p>
                            
                            <div className="border-l-4 border-gray-600 pl-6">
                                <p>
                                    You'll also be able to reference them in chats using the{" "}
                                    <span className="bg-[#FF3D00] text-white px-2 py-1 rounded text-sm font-medium">
                                        @materials
                                    </span>{" "}
                                    and{" "}
                                    <span className="bg-[#FF3D00] text-white px-2 py-1 rounded text-sm font-medium">
                                        @update
                                    </span>{" "}
                                    tags to ask questions about them, and turn them into flashcards, quizzes, and more.
                                </p>
                            </div>
                        </div>
                        
                        {/* Upload Button */}
                        <Button className="bg-[#FF3D00] hover:bg-[#FF3D00]/90 text-white font-medium px-8 py-3 rounded-md transition-colors">
                            Upload a Material
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WorkspacePage
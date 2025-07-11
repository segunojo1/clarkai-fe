"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronDown, Globe, Star, Link as LinkIcon, FileText, Scan } from "lucide-react"
import Image from "next/image"

interface UploadMaterialModalProps {
    children: React.ReactNode
}

export function UploadMaterialModal({ children }: UploadMaterialModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("Materials")

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="bg-[#18191A] border border-[#333] text-white max-w-lg w-[540px] h-[800px] mx-auto p-0 overflow-hidden rounded-2xl shadow-2xl overflow-y-auto overflow-x-hidden" style={{ marginLeft: '300px' }}>
                {/* Nav Tabs */}
                <div className="flex items-center gap-2 px-8 pt-4 pb-2">
                    <button 
                        onClick={() => setActiveTab("Materials")}
                        className={`font-medium text-base transition-colors flex items-center gap-1 px-4 py-2 rounded-lg ${
                            activeTab === "Materials" 
                                ? "bg-[#232323] text-white" 
                                : "text-gray-400 hover:text-white"
                        }`}
                    >
                        Materials
                        <ChevronDown className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setActiveTab("Canvas")}
                        className={`font-medium text-base transition-colors px-4 py-2 rounded-lg ${
                            activeTab === "Canvas" 
                                ? "bg-[#232323] text-white" 
                                : "text-gray-400 hover:text-white"
                        }`}
                    >
                        Canvas
                    </button>
                    <button 
                        onClick={() => setActiveTab("Quizzes")}
                        className={`font-medium text-base transition-colors px-4 py-2 rounded-lg ${
                            activeTab === "Quizzes" 
                                ? "bg-[#232323] text-white" 
                                : "text-gray-400 hover:text-white"
                        }`}
                    >
                        Quizzes
                    </button>
                    <button 
                        onClick={() => setActiveTab("Courses")}
                        className={`font-medium text-base transition-colors px-4 py-2 rounded-lg ${
                            activeTab === "Courses" 
                                ? "bg-[#232323] text-white" 
                                : "text-gray-400 hover:text-white"
                        }`}
                    >
                        Courses
                    </button>
                    <div className="flex-1" />
                    <Button className="bg-transparent border-none text-white font-bold text-2xl p-0 hover:bg-gray-700 w-10 h-10">+</Button>
                    <Button className="bg-transparent border-none text-white p-0 hover:bg-gray-700 w-10 h-10">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18l6-6-6-6"/>
                            <path d="M9 18l6-6-6-6"/>
                        </svg>
                    </Button>
                </div>
                {/* Stats Row - conditional positioning based on active tab */}
                <div className={`flex items-center gap-6 px-8 pb-2 text-base text-gray-400 w-full ${
                    activeTab === "Quizzes" ? "pt-0" : "pt-1"
                }`}>
                    <div className="flex items-center gap-2 bg-[#232323] px-4 py-2 rounded-full font-medium">
                        <span>0 Mat. Uploaded</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <LinkIcon className="w-5 h-5" />
                        <span>0 links</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        <span>0 Docs</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Scan className="w-5 h-5" />
                        <span>0 Scans</span>
                    </div>
                </div>
                {/* Main Content - single column */}
                <div className="flex flex-col items-start justify-start px-12 pr-12 pb-8 pt-4 w-full h-full">
                    {activeTab === "Materials" && (
                        <>
                        {/* Card (icon + text) */}
                        <div className="flex flex-col items-start justify-start mb-8">
                            <div className="rounded-2xl p-0 w-24 h-28 flex flex-col items-center justify-center relative" style={{minHeight: 96}}>
                                {/* File icon - no background, no border */}
                                <div className="flex justify-center mb-2 mt-4">
                                    <Image 
                                        src="/assets/fileIcon.png" 
                                        alt="File icon" 
                                        width={56} 
                                        height={56}
                                        className="w-14 h-14 bg-transparent"
                                        style={{background: 'none'}}
                                    />
                                </div>
                                {/* Star icon in bottom left, smaller and moved down/left */}
                                <Star className="absolute w-3 h-3 text-gray-400 hover:text-yellow-400 cursor-pointer transition-colors" style={{ left: '28px', bottom: '40px' }} />
                                {/* Text */}
                                <div className="text-left w-full pl-4">
                                    <p className="text-gray-300 text-xs font-medium leading-tight">Your Material<br/>goes here</p>
                                </div>
                            </div>
                        </div>
                        {/* Upload Section */}
                        <div className="w-full flex flex-col items-start">
                            <DialogHeader className="text-left mb-8 w-full">
                                <DialogTitle className="text-3xl font-normal text-white flex items-center gap-3 mb-4">
                                    Upload your First Material
                                    <Globe className="w-7 h-7 text-gray-400" />
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 text-base text-gray-300 leading-relaxed mb-8 w-full max-w-xl text-left break-words">
                                <p>
                                    Upload PDFs, videos, or notes to start building your learning flow.
                                </p>
                                <p>
                                    We help you organize every material you add—so everything stays structured, easy to access, and focused on what matters.
                                </p>
                                <div className="border-l-2 border-[#5A5A5A] pl-4">
                                    <p className="break-words whitespace-normal text-sm">
                                        You'll also be able to reference them in chats using the{' '}
                                        <span className="bg-[#FF3D00] text-white px-2 py-1 rounded text-xs font-medium">
                                            @materials
                                        </span>{' '}and{' '}
                                        <span className="bg-[#FF3D00] text-white px-2 py-1 rounded text-xs font-medium">
                                            @update
                                        </span>{' '}tags to ask questions about them,<br />
                                        and turn them into flashcards, quizzes, and more.
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-start w-full">
                                <Button className="bg-[#FF3D00] hover:bg-[#FF3D00]/90 text-white font-medium text-lg px-32 py-4 rounded-md transition-colors ml-4 w-96">
                                    Upload a Material
                                </Button>
                            </div>
                        </div>
                        </>
                    )}
                    {activeTab === "Canvas" && (
                        <div className="w-full flex flex-col items-start justify-start" style={{minHeight: 400}}>
                            <h2 className="text-2xl font-bold text-white mb-4">Canvas</h2>
                            <p className="text-gray-400">Canvas content goes here.</p>
                        </div>
                    )}
                    {activeTab === "Quizzes" && (
                        <>
                        {/* Card (icon + text) - clear placeholder style */}
                        <div className="flex flex-col items-start justify-start mb-8 w-full">
                            <div className="rounded-2xl w-[29rem] h-28 flex flex-col items-center justify-center relative ml-0 border-2 border-dashed border-[#A3A3A3]/40 bg-[#232323]/40" style={{minHeight: 96, marginLeft: '-6%' }}>
                                {/* Very small pen icon, centered */}
                                <div className="flex justify-center mb-2 mt-4">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="bg-transparent"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 14h6"/><path d="M9 10h6"/><path d="M9 18h2"/></svg>
                                </div>
                                {/* Placeholder text below icon, centered */}
                                <div className="text-center w-full px-2">
                                    <p className="text-gray-400 text-xs font-medium leading-tight italic">No quizzes yet...</p>
                                </div>
                            </div>
                        </div>
                        {/* Upload Section - match Materials layout */}
                        <div className="w-full flex flex-col items-start">
                            <DialogHeader className="text-left mb-8 w-full">
                                <DialogTitle className="text-3xl font-normal text-white flex items-center gap-3 mb-4">
                                    Nothing to answer here... yet
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 14h6"/><path d="M9 10h6"/><path d="M9 18h2"/></svg>
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 text-gray-300 leading-relaxed mb-8 w-full max-w-xl text-left break-words">
                                <p className="text-sm">
                                    Create quizzes from your uploaded materials, notes, or custom questions to start testing your knowledge.
                                </p>
                                <p className="text-sm">
                                    Clark helps you generate questions in seconds—organized, trackable, and tailored to what you're learning. You'll be able to revisit them, share with friends, or build streaks by taking them daily.
                                </p>
                                <div className="border-l-2 border-[#5A5A5A] pl-4">
                                    <p className="break-words whitespace-normal text-sm">
                                        Use the <span className="bg-[#FF3D00] text-white px-2 py-1 rounded text-xs font-medium">@quiz</span> tag or "create" button in chat to generate one instantly.
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-start w-full">
                                <Button className="bg-[#FF3D00] hover:bg-[#FF3D00]/90 text-white font-medium text-lg px-32 py-4 rounded-md transition-colors ml-4 w-96">
                                    Create a Quiz
                                </Button>
                            </div>
                        </div>
                        </>
                    )}
                    {activeTab === "Courses" && (
                        <div className="w-full flex flex-col items-start justify-start" style={{minHeight: 400}}>
                            <h2 className="text-2xl font-bold text-white mb-4">Courses</h2>
                            <p className="text-gray-400">Courses content goes here.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
} 
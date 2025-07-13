"use client"

import { useRef, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronDown, Globe, Star, Link as LinkIcon, FileText, Scan, Loader2, X } from "lucide-react"
import Image from "next/image"
import { useWorkspaceStore } from "@/store/workspace.store"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { useParams } from "next/navigation"
import workspaceServiceInstance from "@/services/workspace.service"


interface UploadMaterialModalProps {
    children: React.ReactNode,
    workspaceId: string
}

const formatFileSize = (size: string): string => {
    // The size comes from the API as a formatted string (e.g., "288.32 KB")
    // So we can just return it directly
    return size
}

const formatTimeLeft = (progress: number): string => {
    if (progress === 0) return 'Starting...'
    if (progress === 100) return 'Complete'
    const timeLeft = Math.floor((100 - progress) / 10) // Assuming 10% progress per second
    return `${timeLeft}s left`
}

export function UploadMaterialModal({ children, workspaceId }: UploadMaterialModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("Materials")
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const { selectedWorkspace } = useWorkspaceStore()
    console.log(selectedWorkspace);

    // const { workspace } = selectedWorkspace

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="bg-[#18191A] border border-[#333] text-white  w-[540px] max-h-[800px] mx-auto p-0 overflow-hidden rounded-2xl shadow-2xl overflow-y-auto" style={{ marginLeft: '300px' }}>
                {/* Nav Tabs */}
                <div className="flex items-center gap-2 px-8 pt-4 pb-2">
                    <button
                        onClick={() => setActiveTab("Materials")}
                        className={`font-medium text-base transition-colors flex items-center gap-1 px-4 py-2 rounded-lg ${activeTab === "Materials"
                            ? "bg-[#232323] text-white"
                            : "text-gray-400 hover:text-white"
                            }`}
                    >
                        Materials
                        <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setActiveTab("Canvas")}
                        className={`font-medium text-base transition-colors px-4 py-2 rounded-lg ${activeTab === "Canvas"
                            ? "bg-[#232323] text-white"
                            : "text-gray-400 hover:text-white"
                            }`}
                    >
                        Canvas
                    </button>
                    <button
                        onClick={() => setActiveTab("Quizzes")}
                        className={`font-medium text-base transition-colors px-4 py-2 rounded-lg ${activeTab === "Quizzes"
                            ? "bg-[#232323] text-white"
                            : "text-gray-400 hover:text-white"
                            }`}
                    >
                        Quizzes
                    </button>
                    <button
                        onClick={() => setActiveTab("Courses")}
                        className={`font-medium text-base transition-colors px-4 py-2 rounded-lg ${activeTab === "Courses"
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
                            <path d="M9 18l6-6-6-6" />
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </Button>
                </div>
                {/* Stats Row - conditional positioning based on active tab */}
                <div className={`flex items-center gap-6 px-8 pb-2 text-base text-gray-400 w-full ${activeTab === "Quizzes" ? "pt-0" : "pt-1"
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
                <div className="flex flex-col items-start justify-start px-12 pb-8 pt-4 w-full h-full">
                    {activeTab === "Materials" && (
                        <>
                            {/* Files List */}
                            {selectedWorkspace?.workspace?.files?.pdfFiles?.length > 0 ? (
                                <div className="flex justify-between flex-wrap gap-2 mx-auto">
                                    {selectedWorkspace?.workspace.files.pdfFiles.map((file: { id: string; filePath: string; fileName: string; size: string }) => (
                                        <div key={file.id} className="flex flex-col items-center w-fit max-w-[130px] justify-start mb-8 cursor-pointer hover:bg-[#232323] rounded-2xl p-2" onClick={() => window.open(file.filePath, '_blank')}>
                                            <div className="rounded-2xl p-0 flex flex-col items-center justify-center relative" style={{ minHeight: 96 }}>
                                                {/* File icon - no background, no border */}
                                                <div className="flex justify-center mb-2 mt-4">
                                                    <Image
                                                        src="/assets/fileIcon.png"
                                                        alt="File icon"
                                                        width={56}
                                                        height={56}
                                                        className="w-14 h-14 bg-transparent"
                                                        style={{ background: 'none' }}
                                                    />
                                                </div>
                                                <div className="text-center w-full">
                                                    <p className="text-gray-300 text-xs font-medium leading-tight">{file.fileName}<br />{formatFileSize(file.size)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-start justify-start mb-8">
                                    <div className="rounded-2xl p-0 w-24 h-28 flex flex-col items-center justify-center relative" style={{ minHeight: 96 }}>
                                        {/* File icon - no background, no border */}
                                        <div className="flex justify-center mb-2 mt-4">
                                            <Image
                                                src="/assets/fileIcon.png"
                                                alt="File icon"
                                                width={56}
                                                height={56}
                                                className="w-14 h-14 bg-transparent"
                                                style={{ background: 'none' }}
                                            />
                                        </div>
                                        {/* Text */}
                                        <div className="text-left w-full pl-4">
                                            <p className="text-gray-300 text-xs font-medium leading-tight">Your Material<br />goes here</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* File Preview */}
                            {uploadedFile && !uploading && (
                                <div className="mt-4 p-4 bg-[#232323] rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-medium text-white">{uploadedFile.name}</h3>
                                            <p className="text-xs text-gray-400">{formatFileSize(uploadedFile.size)}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setUploadedFile(null)
                                                setUploadProgress(0)
                                            }}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {/* Upload Section */}
                            <div className="w-full flex flex-col items-start">
                                {selectedWorkspace?.workspace?.files?.pdfFiles?.length == 0 && (
                                    <>
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
                                    </>
                                )}
                                {uploadedFile ? (
                                    <Card className="w-full">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h3 className="text-lg font-medium text-white mb-1">{uploadedFile.name}</h3>
                                                    <p className="text-sm text-gray-400">{formatFileSize(uploadedFile.size)}</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setUploadedFile(null)
                                                        setUploadProgress(0)
                                                    }}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <div className="space-y-4">
                                                <Progress value={uploadProgress} className="h-2" />
                                                <div className="flex justify-between text-sm text-gray-400">
                                                    <span>{uploadProgress}%</span>
                                                    <span>{formatTimeLeft(uploadProgress)}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="flex justify-start w-full">
                                        <FileUploadButton workspaceId={workspaceId} />
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    {activeTab === "Quizzes" && (
                        <>
                            <div className="w-full flex flex-col items-start justify-start">
                                <DialogHeader className="text-left mb-8 w-full">
                                    <DialogTitle className="text-3xl font-normal text-white flex items-center gap-3 mb-4">
                                        Nothing to answer here... yet
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                                            <path d="M9 14h6" />
                                            <path d="M9 10h6" />
                                            <path d="M9 18h2" />
                                        </svg>
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
                                    <Button
                                        className="bg-[#FF3D00] hover:bg-[#FF3D00]/90 text-white font-medium text-lg px-32 py-4 rounded-md transition-colors ml-4 w-96"
                                        onClick={() => {
                                            window.dispatchEvent(new CustomEvent('openQuizPanel', {
                                                detail: { workspaceId: workspaceId }
                                            }))
                                            setIsOpen(false)
                                        }}
                                    >
                                        Create a Quiz
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                    {activeTab === "Courses" && (
                        <div className="w-full flex flex-col items-start justify-start" style={{ minHeight: 400 }}>
                            <div className="rounded-2xl w-[29rem] h-28 flex flex-col items-center justify-center relative ml-0 border-2 border-dashed border-[#A3A3A3]/40 bg-[#232323]/40" style={{ minHeight: 96, marginLeft: '-6%' }}>
                                <div className="text-center w-full px-2">
                                    <p className="text-gray-400 text-xs font-medium leading-tight italic">No courses yet...</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}


export function FileUploadButton({ workspaceId }: { workspaceId: string }) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        setUploadProgress(0)

        try {
            // Simulate upload progress
            const interval = setInterval(() => {
                setUploadProgress(prev => {
                    const next = prev + 10
                    if (next >= 100) {
                        clearInterval(interval)
                        return 100
                    }
                    return next
                })
            }, 500)

            await useWorkspaceStore.getState().uploadFile(file, workspaceId)
            console.log("heyyy");

            const workspace = await workspaceServiceInstance.getWorkspaces(workspaceId)

            useWorkspaceStore.getState().selectWorkspace(workspace)
            clearInterval(interval)
            setUploading(false)
            toast.success("File uploaded successfully")
        } catch (err) {
            setUploading(false)
            setUploadProgress(0)
            toast.error("Failed to upload file")
        }
    }

    return (
        <>
            <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#FF3D00] hover:bg-[#FF3D00]/90 text-white font-medium text-lg px-[100px] py-[10px] cursor-pointer rounded-[5px] transition-colors ml-4 w-96"
            >
                {uploading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading... {uploadProgress}%
                    </>
                ) : (
                    "Upload a Material"
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.webm"
                />
            </button>
        </>
    )
}

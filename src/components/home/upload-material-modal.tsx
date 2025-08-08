"use client"

import { useRef, useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronDown, Globe, Star, Link as LinkIcon, FileText, Scan, Loader2, X, Play, Sparkles, Download } from "lucide-react"
import { PDFDownloadLink } from '@react-pdf/renderer';
import MaterialPdf from './MaterialPdf';
import Image from "next/image"
import { useWorkspaceStore } from "@/store/workspace.store"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { useParams } from "next/navigation"
import workspaceServiceInstance from "@/services/workspace.service"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"


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
    const [isCreatingMaterial, setIsCreatingMaterial] = useState(false)
    const [topic, setTopic] = useState("")
    const [description, setDescription] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [generationProgress, setGenerationProgress] = useState(0)
    const [creationMode, setCreationMode] = useState<'topic' | 'pdf'>('topic')
    const [isMounted, setIsMounted] = useState(false)
    const [selectedPdfs, setSelectedPdfs] = useState<string[]>([])
    const [wordRange, setWordRange] = useState<string>('500-1000')
    const [generatedMaterial, setGeneratedMaterial] = useState<{text: string} | null>(null)
    const { selectedWorkspace } = useWorkspaceStore()

    useEffect(() => {
        setIsMounted(true)
        return () => setIsMounted(false)
    }, [])

    const handleDownloadPdf = (content: string, filename: string) => {
        // This will be handled by the PDFDownloadLink component
        console.log('Preparing PDF download...');
    };
    
    const wordRanges = [
        { value: '300-500', label: 'Short (300-500 words)' },
        { value: '500-1000', label: 'Medium (500-1000 words)' },
        { value: '1000-1500', label: 'Long (1000-1500 words)' },
        { value: '1500-2000', label: 'Detailed (1500-2000 words)' },
    ]

    // console.log(selectedWorkspace);

    // const { workspace } = selectedWorkspace

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="bg-[#18191A] border border-[#333] text-white md:max-w-[500px] max-h-[80vh] p-0 rounded-2xl shadow-2xl overflow-y-auto !top-[30%] !left-[80%] mt-0 ml-0" style={{ transform: 'none' }}>
                {/* Nav Tabs */}
                <div className="flex items-center justify-center gap-2 px-8 pt-4 pb-2">
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
                </div>
                {/* Stats Row - conditional positioning based on active tab */}
                <div className={`flex items-center justify-between  px-8 pb-2 text-[14px] text-gray-400 w-full ${activeTab === "Quizzes" ? "pt-0" : "pt-1"
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
                <div className="flex flex-col items-start justify-start px-4 pb-8 pt-4 w-full h-full">
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
                                                <div className="text-center w-full max-w-[130px]">
                                                    <p className="text-gray-300 text-xs font-medium leading-tight break-words">{file.fileName}<br />{formatFileSize(file.size)}</p>
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
                                    <div className="flex flex-col gap-2 items-center justify-center  w-full">
                                        <FileUploadButton workspaceId={workspaceId} />
                                        <p className="text-[17px] font-bold text-white">OR</p>
                                        <Dialog open={isCreatingMaterial} onOpenChange={setIsCreatingMaterial}>
                                            <DialogTrigger asChild>
                                                <Button className="bg-[#FF3D00] hover:bg-[#FF3D00]/90 text-white font-medium text-lg px-[100px] py-[10px] cursor-pointer rounded-[5px] transition-colors ml-4 w-96">
                                                    Create Material
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[500px] bg-[#2A2A2A] border-[#444] text-white">
                                                <DialogHeader>
                                                    <DialogTitle className="text-2xl font-bold">Create New Material</DialogTitle>
                                                    <DialogDescription className="text-gray-300">
                                                        Choose how you'd like to create your study material.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                
                                                <div className="grid gap-4 py-4">
                                                    {/* Mode Selection */}
                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => setCreationMode('topic')}
                                                            className={`p-4 rounded-lg border-2 transition-all ${creationMode === 'topic' ? 'border-[#FF3D00] bg-[#FF3D00]/10' : 'border-[#444] hover:border-[#666]'}`}
                                                        >
                                                            <div className="flex flex-col items-center text-center">
                                                                <FileText className="h-6 w-6 mb-2" />
                                                                <span className="font-medium">From Topic</span>
                                                                <p className="text-xs text-gray-400 mt-1">Generate from a topic and description</p>
                                                            </div>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setCreationMode('pdf')}
                                                            className={`p-4 rounded-lg border-2 transition-all ${creationMode === 'pdf' ? 'border-[#FF3D00] bg-[#FF3D00]/10' : 'border-[#444] hover:border-[#666]'}`}
                                                        >
                                                            <div className="flex flex-col items-center text-center">
                                                                <FileText className="h-6 w-6 mb-2" />
                                                                <span className="font-medium">From PDF</span>
                                                                <p className="text-xs text-gray-400 mt-1">Generate from an existing PDF</p>
                                                            </div>
                                                        </button>
                                                    </div>

                                                    {creationMode === 'topic' ? (
                                                        <>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="topic" className="text-white">
                                                                    Topic *
                                                                </Label>
                                                                <Input
                                                                    id="topic"
                                                                    placeholder="Enter a topic (e.g., 'Introduction to Quantum Mechanics')"
                                                                    value={topic}
                                                                    onChange={(e) => setTopic(e.target.value)}
                                                                    className="bg-[#333] border-[#444] text-white placeholder-gray-400"
                                                                />
                                                            </div>
                                                            
                                                            <div className="">
                                                                <div className="space-y-2 min-w-full">
                                                                    <Label htmlFor="word-range" className="text-white">
                                                                        Length
                                                                    </Label>
                                                                    <select
                                                                        id="word-range"
                                                                        value={wordRange}
                                                                        onChange={(e) => setWordRange(e.target.value)}
                                                                        className="w-full p-2 bg-[#333] border border-[#444] rounded-md text-white"
                                                                    >
                                                                        {wordRanges.map((range) => (
                                                                            <option key={range.value} value={range.value}>
                                                                                {range.label}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="description" className="text-white">
                                                                    Additional Context (Optional)
                                                                </Label>
                                                                <Textarea
                                                                    id="description"
                                                                    placeholder="Provide more details about what you want to learn..."
                                                                    rows={3}
                                                                    value={description}
                                                                    onChange={(e) => setDescription(e.target.value)}
                                                                    className="bg-[#333] border-[#444] text-white placeholder-gray-400"
                                                                />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="space-y-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-white">
                                                                    Select PDFs from Workspace
                                                                </Label>
                                                                <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-[#2a2a2a] rounded-md">
                                                                {isMounted && selectedWorkspace?.workspace?.files?.pdfFiles
                                                                    ?.filter(m => m.fileName.endsWith('.pdf'))
                                                                    .map((material) => (
                                                                        <div key={material.id} className="flex items-center space-x-2">
                                                                            <input
                                                                                type="checkbox"
                                                                                id={`pdf-${material.id}`}
                                                                                checked={selectedPdfs.includes(material.id)}
                                                                                onChange={(e) => {
                                                                                    if (e.target.checked) {
                                                                                        setSelectedPdfs([...selectedPdfs, material.id]);
                                                                                    } else {
                                                                                        setSelectedPdfs(selectedPdfs.filter(id => id !== material.id));
                                                                                    }
                                                                                }}
                                                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                            />
                                                                            <label htmlFor={`pdf-${material.id}`} className="text-sm text-gray-300 cursor-pointer">
                                                                                {material.fileName}
                                                                            </label>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <p className="text-xs text-gray-400 mt-1">
                                                                    {selectedWorkspace?.workspace?.files?.pdfFiles?.filter(m => m.fileName.endsWith('.pdf')).length === 0 
                                                                        ? 'No PDFs found in your workspace. Please upload a PDF first.'
                                                                        : selectedPdfs.length > 0 
                                                                            ? `${selectedPdfs.length} PDF${selectedPdfs.length > 1 ? 's' : ''} selected`
                                                                            : 'Select one or more PDFs to generate material from.'}
                                                                </p>
                                                            </div>
                                                            
                                                            <div className="space-y-2">
                                                                <Label htmlFor="pdf-description" className="text-white">
                                                                    Additional Instructions (Optional)
                                                                </Label>
                                                                <Textarea
                                                                    id="pdf-description"
                                                                    placeholder="Any specific focus or requirements for the generated material..."
                                                                    rows={2}
                                                                    value={description}
                                                                    onChange={(e) => setDescription(e.target.value)}
                                                                    className="bg-[#333] border-[#444] text-white placeholder-gray-400"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {isGenerating && (
                                                        <div className="space-y-2 pt-2">
                                                            <div className="flex items-center gap-2 text-blue-400">
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                                <span>Generating your material...</span>
                                                            </div>
                                                            <Progress value={generationProgress} className="h-2" />
                                                            <p className="text-xs text-gray-400 text-right">
                                                                This may take a moment. Please don't close this window.
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <DialogFooter className="sm:justify-between">
                                                    <DialogClose asChild>
                                                        <Button 
                                                            type="button" 
                                                            variant="outline"
                                                            className="border-gray-600 text-white hover:bg-gray-700"
                                                            disabled={isGenerating}
                                                        >
                                                            Cancel
                                                        </Button> 
                                                    </DialogClose>
                                                    <Button 
                                                        type="submit" 
                                                        className="bg-[#FF3D00] hover:bg-[#FF3D00]/90 text-white"
                                                        disabled={isGenerating || (creationMode === 'topic' ? !topic.trim() : selectedPdfs.length === 0)}
                                                        onClick={async () => {
                                                            if ((creationMode === 'topic' && !topic.trim()) || 
                                                                (creationMode === 'pdf' && selectedPdfs.length === 0)) {
                                                                return;
                                                            }
                                                            
                                                            try {
                                                                setIsGenerating(true);
                                                                // Simulate generation progress
                                                                const interval = setInterval(() => {
                                                                    setGenerationProgress(prev => {
                                                                        if (prev >= 90) {
                                                                            clearInterval(interval);
                                                                            return prev;
                                                                        }
                                                                        return prev + 10;
                                                                    });
                                                                }, 500);
                                                                
                                                                // TODO: Replace with actual API call to generate material
                                                                // The API endpoint will be different based on the creation mode
                                                                // const payload = creationMode === 'topic' 
                                                                //     ? { 
                                                                //         topic, 
                                                                //         description, 
                                                                //         type: 'topic',
                                                                //         words_range: wordRange,
                                                                //         is_tag: true
                                                                //       }
                                                                //     : { 
                                                                //         pdfId: selectedPdf, 
                                                                //         instructions: description, 
                                                                //         type: 'pdf',
                                                                //         words_range: wordRange
                                                                //       };
                                                                
                                                                const workspace = await workspaceServiceInstance.generateMaterial(
                                                                    creationMode === 'topic' ? topic : '',
                                                                    wordRange,
                                                                    true,
                                                                    description,
                                                                    creationMode === 'pdf' ? selectedPdfs : undefined
                                                                )
                                                                
                                                                console.log('Generating material with:', workspace);
                                                                
                                                                clearInterval(interval);
                                                                setGenerationProgress(100);
                                                                
                                                                // Simulate completion
                                                                await new Promise(resolve => setTimeout(resolve, 500));
                                                                
                                                                if (workspace?.pdfGenerated && workspace?.text) {
                                                                    setGeneratedMaterial({ text: workspace.text });
                                                                    // Auto-download the markdown
                                                                    // PDF download will be handled by the PDFDownloadLink component
                                                                    toast.success('Material generated and downloaded successfully!');
                                                                } else {
                                                                    toast.error('Failed to generate material. Please try again.');
                                                                }
                                                                
                                                                // setShowCreateDialog(false);
                                                                setTopic('');
                                                                setDescription('');
                                                                setSelectedPdfs([]);
                                                                setGenerationProgress(0);
                                                                setIsGenerating(false);
                                                                setCreationMode('topic');
                                                            } catch (error) {
                                                                console.error('Error generating material:', error);
                                                                toast.error('Failed to generate material. Please try again.');
                                                            } finally {
                                                                setIsGenerating(false);
                                                            }
                                                        }}
                                                    >
                                                        <Sparkles className="mr-2 h-4 w-4" />
                                                        {isGenerating ? 'Generating...' : 'Generate Material'}
                                                    </Button>
                                                    </DialogFooter>
                                                    {generatedMaterial && (
                                                        <div className="p-4 mt-4 bg-gray-800 rounded-md">
                                                            <div className="flex flex-col space-y-4">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-white">Material Ready!</span>
                                                                    {generatedMaterial?.text && (
                                                                        <PDFDownloadLink
                                                                            document={
                                                                                <MaterialPdf 
                                                                                    content={generatedMaterial.text} 
                                                                                    title={`Material - ${new Date().toISOString().slice(0, 10)}`}
                                                                                />
                                                                            }
                                                                            fileName={`material-${new Date().toISOString().slice(0, 10)}.pdf`}
                                                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
                                                                        >
                                                                            {({ blob, url, loading, error }) => (
                                                                                <>
                                                                                    <Download className="mr-2 h-4 w-4" />
                                                                                    {loading ? 'Generating PDF...' : 'Download PDF'}
                                                                                </>
                                                                            )}
                                                                        </PDFDownloadLink>
                                                                    )}
                                                                </div>
                                                                {generatedMaterial?.text && (
                                                                    <div className="text-xs text-gray-400">
                                                                        If the download doesn't start automatically, click the button above.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    {activeTab === "Quizzes" && (
                        <>
                            {selectedWorkspace?.workspace?.quizzes?.length > 0 ? (
                                <div className="w-full space-y-4">
                                    <h3 className="text-lg font-medium text-white mb-4">Available Quizzes</h3>
                                    <div className="grid gap-4">
                                        {selectedWorkspace.workspace.quizzes.map((quiz, index) => (
                                            <div key={quiz.id || index} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-primary transition-colors">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="text-white font-medium">{quiz.name || 'Untitled Quiz'}</h4>
                                                        <p className="text-sm text-gray-400 mt-1">
                                                            Created {new Date(quiz.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2 items-center">
                                                        <Link href={`/quiz/${quiz.id}`}>
                                                            Start Quiz
                                                        </Link>
                                                    </div>
                                                </div>
                                                {quiz.quizSource && (
                                                    <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                                                        {quiz.quizSource}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
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
                            )}
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

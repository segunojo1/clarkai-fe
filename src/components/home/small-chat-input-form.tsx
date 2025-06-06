"use client"

import { FormField, FormItem, FormControl, Form } from "@/components/ui/form"
import { chatSchema } from "@/models/validations/chat.validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChangeEvent, KeyboardEvent, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { X, FileText } from "lucide-react"
import { useChatStore } from "@/store/chat.store"
import { toast } from "sonner"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import Image from "next/image"
import { ArrowUp, Loader } from "lucide-react"
import { FormMessage } from "../ui/form"

const ChatInputForm2 = ({
    onSend,
    disabled
}: {
    onSend: (message: string, file?: File) => void,
    disabled?: boolean
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>('')
    const [mode, setMode] = useState<'ask' | 'research' | 'create'>('ask')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const form = useForm<z.infer<typeof chatSchema>>({
        resolver: zodResolver(chatSchema),
        defaultValues: {
            chat: "",
        },
    })

    const { isLoading } = useChatStore()

    const handleSubmit = async (values: z.infer<typeof chatSchema>) => {
        if (!values.chat.trim() && !selectedFile) return

        try {
            onSend(values.chat, selectedFile || undefined)
            form.reset()
            setSelectedFile(null)
            setPreviewUrl('')
        } catch (error) {
            console.error('Error sending message:', error)
            toast.error('Failed to send message')
        }
    }

    const triggerFileInput = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Check if file is PDF
        if (file.type !== 'application/pdf') {
            toast.error('Only PDF files are supported')
            return
        }

        setSelectedFile(file)
        console.log(selectedFile);

        setPreviewUrl(URL.createObjectURL(file))
    }

    const removeFile = () => {
        setSelectedFile(null)
        setPreviewUrl('')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            form.handleSubmit(handleSubmit)();
        }
    };

    return (
        <div className="w-full max-w-[500px] mx-auto px-4">
            <Form {...form}> 
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3 w-full relative">
                    {/* File preview section */}
                    {(selectedFile || previewUrl) && (
                        <div className="absolute -top-25 left-0 w-full max-w-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2C2C2C] rounded-lg p-3">
                            <div className="flex justify-between items-start gap-3">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div className="flex-shrink-0 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                                        <FileText className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {selectedFile?.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            {selectedFile?.size ? `${(selectedFile.size / 1024).toFixed(1)} KB` : ''}
                                        </p>
                                        <div className="mt-2">
                                            <button
                                                type="button"
                                                className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                                                onClick={() => {
                                                    if (selectedFile) {
                                                        window.open(previewUrl, '_blank')
                                                    }
                                                }}
                                            >
                                                <span>Open in new tab</span>
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-transparent"
                                    onClick={removeFile}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    <FormField
                        control={form.control}
                        name="chat"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="relative  border-[0.3px] border-[#D4D4D4] bg-white dark:bg-[#2C2C2C] rounded-[12px] overflow-hidden">
                                        <Textarea
                                            onKeyDown={handleKeyDown}
                                            placeholder={
                                                mode === 'ask'
                                                    ? "Ask anything… or type @ to see Clark's magic commands..."
                                                    : mode === 'research'
                                                        ? "Research a topic..."
                                                        : "Create something new..."
                                            }
                                            {...field}
                                            className="min-h-[100px] max-h-[180px] text-[16px] max-w-[750px] font-medium p-3 w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none resize-none"
                                        />
                                        <div className="flex items-center gap-2 p-2 border-[#D4D4D4]">
                                            <Tabs
                                                value={mode}
                                                onValueChange={(value) => setMode(value as 'ask' | 'research' | 'create')}
                                                className="flex-1"
                                            >
                                                <TabsList className="bg-[#F5F5F5] dark:bg-[#262626] rounded-[8px] p-0 py-3 px-2 h-8 justify-start gap-1 text-[12px]">
                                                    <TabsTrigger
                                                        value="ask"
                                                        className="data-[state=active]:bg-white py-3 data-[state=active]:shadow-none rounded-md px-2 h-full text-sm font-medium text-gray-600 data-[state=active]:text-[#FF3D00]"
                                                    >
                                                        Ask
                                                    </TabsTrigger>
                                                    <TabsTrigger
                                                        value="research"
                                                        className="data-[state=active]:bg-white data-[state=active]:shadow-none rounded-md px-2 py-3 h-full text-sm font-medium text-gray-600 data-[state=active]:text-[#FF3D00]"
                                                    >
                                                        Research
                                                    </TabsTrigger>
                                                    <TabsTrigger
                                                        value="create"
                                                        className="data-[state=active]:bg-white data-[state=active]:shadow-none rounded-md px-2 py-3 h-full text-sm font-medium text-gray-600 data-[state=active]:text-[#FF3D00]"
                                                    >
                                                        Create
                                                    </TabsTrigger>
                                                </TabsList>
                                            </Tabs>
                                            <div className="flex items-center gap-2">
                                                <div>
                                                    <div onClick={triggerFileInput}>
                                                        <Image src="/assets/file.svg" alt="" width={30} height={30} className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
                                                    </div>
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        onChange={handleFileChange}
                                                        accept="image/*,.pdf"
                                                        className="hidden"
                                                    />
                                                </div>
                                                <Image src="/assets/waveform.svg" alt="" width={30} height={30} className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
                                                <Image src="/assets/at.svg" alt="" width={21} height={30} />
                                                <Button
                                                    type="submit"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full bg-[#FAFAFA] hover:bg-[#FF3D00]/90"
                                                    disabled={disabled || isLoading}
                                                >
                                                    {isLoading ? (
                                                        <Loader className="h-4 w-4 text-[#0A0A0A] animate-spin" />
                                                    ) : (
                                                        <ArrowUp className="h-4 w-4 text-[#0A0A0A]" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
        </div>
    )
}

export default ChatInputForm2
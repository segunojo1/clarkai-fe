"use client"

import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { chatSchema } from "@/models/validations/chat.validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChangeEvent, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { ArrowUp, AudioWaveform, Loader, Paperclip, X } from "lucide-react"
import Image from "next/image"
import { useChatStore } from "@/store/chat.store"
import { toast } from "sonner"

const ChatInputForm = ({ 
  onSend, 
  disabled 
}: { 
  onSend: (message: string, file?: File) => void, 
  disabled?: boolean 
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const form = useForm<z.infer<typeof chatSchema>>({
    resolver: zodResolver(chatSchema),
    defaultValues: {
      chat: "",
    },
  })

  const { isLoading } = useChatStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(values: z.infer<typeof chatSchema>) {
    onSend(values.chat, selectedFile || undefined);
    form.reset();
    setSelectedFile(null);
    setPreviewUrl('');
  }

  const [mode, setMode] = useState("ask");

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (image or PDF)
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('Please select an image or PDF file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      // For PDF files, we'll just show the file name
      setPreviewUrl('');
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 satoshi flex flex-col">
        {/* File preview section */}
        {(selectedFile || previewUrl) && (
          <div className="relative min-w-[750px] border-[0.3px] border-[#D4D4D4] bg-white dark:bg-[#2C2C2C] rounded-[12px] p-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="h-12 w-12 object-cover rounded"
                  />
                ) : (
                  <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                    <span className="text-xs">PDF</span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium truncate max-w-[200px]">
                    {selectedFile?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile?.size || 0) / 1024 > 1024
                      ? `${((selectedFile?.size || 0) / 1024 / 1024).toFixed(1)} MB`
                      : `${Math.round((selectedFile?.size || 0) / 1024)} KB`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="chat"
          render={({ field }) => (
            <FormItem>
              <FormControl className=" ">
                <div className="relative min-w-[750px] border-[0.3px] border-[#D4D4D4] bg-white dark:bg-[#2C2C2C] rounded-[12px] overflow-hidden">
                  <Textarea
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
                      onValueChange={(value) => setMode(value as string)}
                      className="flex-1"
                    >
                      <TabsList className="bg-[#F5F5F5] dark:bg-[#262626] rounded-[8px] p-0 py-5 px-2 h-8 justify-start gap-1">
                        <TabsTrigger
                          value="ask"
                          className="data-[state=active]:bg-white py-4 data-[state=active]:shadow-none rounded-md px-4 h-full text-sm font-medium text-gray-600 data-[state=active]:text-[#FF3D00]"
                        >
                          Ask
                        </TabsTrigger>
                        <TabsTrigger
                          value="research"
                          className="data-[state=active]:bg-white data-[state=active]:shadow-none rounded-md px-4 py-4 h-full text-sm font-medium text-gray-600 data-[state=active]:text-[#FF3D00]"
                        >
                          Research
                        </TabsTrigger>
                        <TabsTrigger
                          value="create"
                          className="data-[state=active]:bg-white data-[state=active]:shadow-none rounded-md px-4 py-4 h-full text-sm font-medium text-gray-600 data-[state=active]:text-[#FF3D00]"
                        >
                          Create
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                    <div className="flex items-center gap-2">
                      <div>
                        <div onClick={triggerFileInput}>
                          <Paperclip className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
                        </div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*,.pdf"
                          className="hidden"
                        />
                      </div>
                      <AudioWaveform className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
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
  )
}

export default ChatInputForm
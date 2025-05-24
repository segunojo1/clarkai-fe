"use client"

import { FormField, FormItem, FormControl, Form } from "@/components/ui/form"
import { chatSchema } from "@/models/validations/chat.validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChangeEvent, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { Loader2, Paperclip, X, FileText, SendHorizontal } from "lucide-react"
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof chatSchema>>({
    resolver: zodResolver(chatSchema),
    defaultValues: {
      chat: "",
    },
  });

  const { isLoading } = useChatStore();

  const handleSubmit = async (values: z.infer<typeof chatSchema>) => {
    if (!values.chat.trim() && !selectedFile) return;
    
    try {
      onSend(values.chat, selectedFile || undefined);
      form.reset();
      setSelectedFile(null);
      setPreviewUrl('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is PDF
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are supported');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3 w-full">
          {/* File preview section */}
          {(selectedFile || previewUrl) && (
            <div className="relative w-full max-w-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2C2C2C] rounded-lg p-3">
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
                            window.open(URL.createObjectURL(selectedFile), '_blank');
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
                  <div className="relative">
                    <Textarea
                      placeholder="Ask me anything..."
                      className="min-h-[60px] pr-16 resize-none bg-white dark:bg-[#2C2C2C] border-[#D4D4D4] dark:border-gray-700 rounded-2xl focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-offset-transparent focus-visible:ring-transparent focus-visible:outline-none focus-visible:border-blue-500 dark:focus-visible:border-blue-400"
                      {...field}
                    />
                    <div className="absolute right-2 bottom-2 flex items-center gap-1">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf"
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full text-gray-500 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={triggerFileInput}
                        disabled={disabled}
                      >
                        <Paperclip className="h-5 w-5" />
                      </Button>
                      <Button
                        type="submit"
                        size="icon"
                        className="h-9 w-9 rounded-full bg-[#FF5B22] hover:bg-[#FF5B22]/90 text-white"
                        disabled={isLoading || disabled}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <SendHorizontal className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
};

export default ChatInputForm;

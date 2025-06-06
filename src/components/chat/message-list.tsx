'use client'

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from "@/lib/types";
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { FileAttachment as FileAttachmentType } from '@/lib/types';
import { ChevronRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFViewer } from './pdf-viewer';
import UserAvatar from '../user-avatar';
import { cn } from '@/lib/utils';
import { useSidebar } from '../ui/sidebar';

// const isFile = (obj: unknown): obj is File => {
//   if (obj instanceof File) return true;
//   if (typeof obj !== 'object' || obj === null) return false;

//   const fileLike = obj as Record<keyof File, unknown>;
//   return (
//     typeof fileLike.name === 'string' &&
//     typeof fileLike.size === 'number' &&
//     typeof fileLike.type === 'string'
//   );
// };

const FileAttachmentPreview = ({ file }: { file: FileAttachmentType | File }) => {
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const fileUrlRef = useRef<string>('');
  const { setOpen } = useSidebar()

  // Create object URL for the file
  useEffect(() => {
    const createObjectUrl = () => {
      // Clean up previous URL if it exists
      if (fileUrlRef.current) {
        URL.revokeObjectURL(fileUrlRef.current);
        fileUrlRef.current = '';
      }

      if (!file) return;

      try {
        // If it's a File object
        if (file instanceof File) {
          fileUrlRef.current = URL.createObjectURL(file);
        }
        // If it's a FileAttachment with data
        else if ('type' in file) {
          const blob = new Blob([], { type: file.type });
          fileUrlRef.current = URL.createObjectURL(blob);
        }
      } catch (error) {
        console.error('Error creating file URL:', error);
      }
    };

    createObjectUrl();

    // Cleanup function
    return () => {
      if (fileUrlRef.current) {
        URL.revokeObjectURL(fileUrlRef.current);
      }
    };
  }, [file]);

  const handleOpenInCanvas = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPdfViewer(true);
    setOpen(false)
  };

  if (!file) return null;

  const getFileUrl = () => {
    if (file instanceof File) {
      return fileUrlRef.current || URL.createObjectURL(file);
    }
    if ('url' in file && file.url) {
      return file.url;
    }
    return fileUrlRef.current;
  };

  return (
    <>
      <div className="mt-2 flex flex-col items-start gap-2">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-700 dark:text-gray-300 flex items-center gap-2"
            onClick={handleOpenInCanvas}
          >
            View in Canvas
            <ChevronRight />
          </Button>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg dark:bg-[#404040] flex flex-col items-center gap-2">
          <div className="flex-1 flex gap-2 min-w-0">
            <FileText className="text-[#FF3D00]" size={20} />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {file.name}
            </p>
          </div>
          <div className='flex items-center gap-2 self-start'>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {file.size ? `${(file.size / 1024).toFixed(1)} KB` : ''}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 px-0"
              onClick={() => {
                const url = getFileUrl();
                if (url) window.open(url, '_blank');
              }}
            >
              Open
            </Button>
          </div>
        </div>
      </div>

      {showPdfViewer && (
        <PDFViewer
          file={file instanceof File ? file :
            'url' in file && file.url ? file.url :
              new File([], file.name, { type: file.type })}
          onClose={() => setShowPdfViewer(false)}
        />
      )}
    </>
  );
};

export function ChatMessageList({
  messages,
  isLoading,
  className
}: {
  messages: ChatMessage[],
  isLoading: boolean,
  className?: string
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Dependency on messages array

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={cn("flex w-full flex-col space-y-4 p-4 overflow-y-auto h-[calc(100vh-200px)]", className)}>
      <div className='absolute left-5'>
        <UserAvatar />
      </div>
      {messages.length > 0 && (
        <div className="h-[140px]"></div>
      )}
      <div className='max-w-[750px] w-full mx-auto'>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex flex-col items-${message.fromUser ? 'end' : 'start'} text-[15px] satoshi font-normal mb-4 w-full`}
          >
            <div className="flex flex-col items-end max-w-[80%] gap-2">
              {message.attachments?.map((file, fileIndex) => (
                <div
                  key={fileIndex}
                  className={`w-full rounded-2xl ${message.fromUser ? '' : 'bg-gray-100 dark:bg-gray-800'}`}
                >
                  <FileAttachmentPreview file={file} />
                </div>
              ))}

              {message.text && (
                <div
                  className={`rounded-[69px] p-4 ${message.fromUser
                    ? 'bg-[#F0F0EF] dark:bg-[#404040] dark:text-white text-black'
                    : 'bg-transparent'
                    }`}
                >
                  {message.fromUser ? (
                    <p>{message.text}</p>
                  ) : (
                    <Markdown remarkPlugins={[remarkGfm]}>{message.text}</Markdown>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-w-[80%]">
              <div className="flex gap-2">
                <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse delay-100"></div>
                <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse delay-200"></div>
              </div>
            </div>
          </div>
        )}

        {/* This empty div will be used for auto-scrolling */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { ChatMessage } from "@/lib/types";

interface FileAttachment {
  name: string;
  size?: number;
  url?: string;
  file?: File | string;
}
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFViewer } from './pdf-viewer';

const FileAttachmentPreview = ({ file }: { file: FileAttachment }) => {
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | File>('');
  
  // Get the file URL or create one from the file object
  useEffect(() => {
    let objectUrl: string | null = null;
    let isMounted = true;

    const processFile = async () => {
      try {
        if (file.url) {
          if (isMounted) setFileUrl(file.url);
        } else if (file.file) {
          if (isMounted) setFileUrl(file.file);
        }
      } catch (error) {
        console.error('Error processing file:', error);
      }
    };

    processFile();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [file]);
  
  // Create a URL for the file if it's a File object
  const fileObjectUrl = useMemo(() => {
    if (!file.file || typeof file.file === 'string') return '';
    try {
      return URL.createObjectURL(file.file);
    } catch (error) {
      console.error('Error creating object URL:', error);
      return '';
    }
  }, [file.file]);
  
  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (fileObjectUrl) {
        URL.revokeObjectURL(fileObjectUrl);
      }
    };
  }, [fileObjectUrl]);

  const handleOpenInCanvas = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPdfViewer(true);
  };

  if (!file) return null;

  return (
    <>
      <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center gap-2">
          <FileText className="text-[#FF3D00]" size={20} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {file.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {file.size ? `${(file.size / 1024).toFixed(1)} KB` : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={() => {
              if (fileUrl) {
                if (typeof fileUrl === 'string') {
                  window.open(fileUrl, '_blank');
                } else {
                  const url = URL.createObjectURL(fileUrl);
                  window.open(url, '_blank');
                  // The URL will be revoked when the window is closed
                }
              }
            }}
            >
              Open
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-gray-700 dark:text-gray-300"
              onClick={handleOpenInCanvas}
            >
              View in Canvas
            </Button>
          </div>
        </div>
      </div>
      
      {showPdfViewer && (
        <PDFViewer 
          file={fileUrl || file.file || file.url} 
          onClose={() => setShowPdfViewer(false)} 
        />
      )}
    </>
  );
};

export function ChatMessageList({ 
  messages, 
  isLoading 
}: { 
  messages: ChatMessage[], 
  isLoading: boolean 
}) {
  return (
    <div className="flex flex-col space-y-4 p-4 overflow-y-auto h-[calc(100vh-200px)]">
      {messages.length > 0 && (
        <div className="h-[140px]"></div>
      )}
      {messages.map((message, index) => (
        <div 
          key={index} 
          className={`flex flex-col items-${
            message.role === 'user' ? 'end' : 'start'
          } text-[15px] satoshi font-normal mb-4 w-full`}
        >
          <div className="flex flex-col items-end max-w-[80%] gap-2">
            {/* File attachments */}
            {message.attachments?.map((file, fileIndex) => (
              <div 
                key={fileIndex} 
                className={`w-full rounded-2xl p-4 ${
                  message.role === 'user' 
                    ? 'max-w-[227px]' 
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                <FileAttachmentPreview file={file}  />
              </div>
            ))}
            
            {/* Message content */}
            {message.content && (
              <div 
                className={`rounded-[69px] p-4 ${
                  message.role === 'user' 
                    ? 'bg-[#F0F0EF] text-black' 
                    : 'bg-transparent'
                }`}
              >
                <p>{message.content}</p>
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
    </div>
  )
}
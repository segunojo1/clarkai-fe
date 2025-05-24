'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChatMessage } from "@/lib/types";

// Import the FileAttachment type from types
import type { FileAttachment as FileAttachmentType } from '@/lib/types';

// Extend the File type to include our custom properties
type ExtendedFile = File & {
  url?: string;
};

// Helper function to check if an object is a File
const isFile = (obj: any): obj is File => {
  return obj instanceof File || 
         (obj && typeof obj === 'object' && 
          'name' in obj && 
          'size' in obj && 
          'type' in obj);
};

// Helper function to convert FileAttachment to File-like object
const toFile = (attachment: FileAttachmentType): File => {
  return new File(
    [], 
    attachment.name, 
    { 
      type: attachment.type,
      lastModified: Date.now()
    }
  );
};
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFViewer } from './pdf-viewer';

const FileAttachmentPreview = ({ file }: { file: FileAttachmentType | File }) => {
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [objectUrl, setObjectUrl] = useState<string>('');
  
  console.log(file);
  
  // Create and clean up object URL for the file
  const fileUrlRef = useRef<string>('');
  
  useEffect(() => {
    const createObjectUrl = async () => {
      // Clean up previous URL if it exists
      if (fileUrlRef.current) {
        URL.revokeObjectURL(fileUrlRef.current);
        fileUrlRef.current = '';
      }

      if (!file) {
        setObjectUrl('');
        return;
      }

      try {
        let newUrl = '';
        
        // If it's a File object
        if (file instanceof File) {
          newUrl = URL.createObjectURL(file);
          fileUrlRef.current = newUrl;
        }
        // If it's a FileAttachment with a URL
        else if ('url' in file && file.url) {
          newUrl = file.url;
        }
        // If it's a FileAttachment with data
        else if ('type' in file) {
          const blob = new Blob([], { type: file.type });
          newUrl = URL.createObjectURL(blob);
          fileUrlRef.current = newUrl;
        }
        
        setObjectUrl(newUrl);
      } catch (error) {
        console.error('Error creating file URL:', error);
        setObjectUrl('');
      }
    };

    createObjectUrl();
    
    // Cleanup function to revoke the object URL
    return () => {
      if (fileUrlRef.current) {
        URL.revokeObjectURL(fileUrlRef.current);
        fileUrlRef.current = '';
      }
    };
  }, [file]);

  const handleOpenInCanvas = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Always use the same objectUrl that was created in the effect
    if (objectUrl) {
      setShowPdfViewer(true);
    }
  };
  
  const handleOpenInNewTab = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (objectUrl) {
      window.open(objectUrl, '_blank');
    }
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
                if (objectUrl) {
                  window.open(objectUrl, '_blank');
                } else if (isFile(file)) {
                  const url = URL.createObjectURL(file);
                  window.open(url, '_blank');
                  // The URL will be revoked when the window is closed
                } else if ('url' in file && file.url) {
                  window.open(file.url, '_blank');
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
          file={file} 
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
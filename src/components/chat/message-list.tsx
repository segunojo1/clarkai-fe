'use client'

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from "@/lib/types";
import type { FileAttachment as FileAttachmentType } from '@/lib/types';
import { ChevronRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFViewer } from './pdf-viewer';
import UserAvatar from '../user-avatar';
import { cn } from '@/lib/utils';
import { useSidebar } from '../ui/sidebar';
import MarkdownRenderer from '../markdown-renderer';
import { Flashcard, FlashcardModal } from '@/components/flashcards/flashcard-modal';

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

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    // Optionally show a toast or feedback
    console.log("Copied to clipboard!");
  });
};

export function ChatMessageList({
  messages,
  isLoading,
  className
}: {
  messages: ChatMessage[]
  isLoading: boolean
  className?: string
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedFlashcards, setSelectedFlashcards] = useState<Flashcard[]>([]);
  const [isFlashcardModalOpen, setIsFlashcardModalOpen] = useState(false);

  const extractFlashcards = (text: string): Flashcard[] | null => {
    try {
      // Check if the message contains flashcard data
      const regex = /### Flashcard \d+\n\*\*Q:\*\* ([^\n]*)\n\*\*A:\*\* ([^\n]*)(?:\n|$)/g;
      const matches: RegExpExecArray[] = [];
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        matches.push(match);
      }
      
      if (matches.length === 0) return null;

      return matches.map(match => ({
        question: match[1] || '',
        answer: match[2] || ''
      }));
    } catch (error) {
      console.error('Error parsing flashcards:', error);
      return null;
    }
  };

  const generateFlashcards = (context: string): Flashcard[] => {
    // Simple flashcard generation based on the context
    // You can customize this to create more meaningful flashcards
    return [
      {
        question: `What is the main topic of: ${context}?`,
        answer: context,
        explanation: 'This is a generated flashcard based on your input.'
      },
      {
        question: `Explain in detail: ${context}`,
        answer: `Detailed explanation about ${context} would go here.`,
        explanation: 'This is a generated flashcard for detailed explanation.'
      }
    ];
  };

  const handleFlashcardClick = (text: string, isUserMessage: boolean) => {
    if (isUserMessage) {
      // For user messages with @flashcard tag, generate flashcards based on the context
      const context = text.replace(/@flashcard\s*/g, '').trim();
      if (context) {
        const generatedFlashcards = generateFlashcards(context);
        setSelectedFlashcards(generatedFlashcards);
        setIsFlashcardModalOpen(true);
      }
    } else {
      // For AI responses, try to parse existing flashcards
      const flashcards = extractFlashcards(text);
      if (flashcards) {
        setSelectedFlashcards(flashcards);
        setIsFlashcardModalOpen(true);
      }
    }
  };

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
        {messages.map((message) => {
          const isFlashcardMessage = message.fromUser 
            ? message.text.includes('@flashcard')
            : message.text.includes('Flashcard');
          
          return (
            <div key={`${message.role}`} className={cn({
              'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors': isFlashcardMessage
            })}
            onClick={() => isFlashcardMessage && handleFlashcardClick(message.text, message.fromUser)}
            >
              <div
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
                    <div className={`relative group rounded-[69px] p-4 ${message.fromUser ? 'bg-[#F0F0EF] dark:bg-[#404040] dark:text-white text-black' : 'bg-transparent'}`}>
                      {message.fromUser ? (
                        <p>{message.text}</p>
                      ) : (
                        <div className="markdown-body text-black dark:text-white">
                          <MarkdownRenderer content={message.text} />
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="absolute right-0 mt-1 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => copyToClipboard(message.text)}
                          className="text-sm text-blue-500 hover:underline"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {isFlashcardMessage && message.fromUser && (
                <div className="mt-2 ml-14">
                  <div className="bg-gray-50 p-4 rounded-lg dark:bg-[#404040] flex flex-col items-center gap-2">
                    <div className="flex-1 flex gap-2 min-w-0">
                      <div className="bg-primary/10 text-primary p-1.5 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="3" y1="9" x2="21" y2="9"></line>
                          <line x1="9" y1="21" x2="9" y2="9"></line>
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        Click to view generated flashcards
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {message.text === 'Generating flashcards...' && (
                <div className="mt-2 ml-14">
                  <div className="bg-gray-50 p-4 rounded-lg dark:bg-[#404040] flex flex-col items-center gap-2">
                    <div className="flex-1 flex gap-2 min-w-0">
                      <div className="bg-primary/10 text-primary p-1.5 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 12c0 5.5-4.5 10-10 10S1 17.5 1 12 5.5 2 11 2 21 6.5 21 12z"></path>
                          <circle cx="11" cy="12" r="2"></circle>
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        Flashcards are being generated...
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {isLoading && (
          <div className="flex items-center justify-center">
            <div className="flex gap-2">
              <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
              <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse delay-100"></div>
              <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse delay-200"></div>
            </div>
          </div>
        )}

        {/* Flashcard Modal */}
        <FlashcardModal 
          isOpen={isFlashcardModalOpen} 
          onClose={() => setIsFlashcardModalOpen(false)} 
          flashcards={selectedFlashcards} 
        />

        {/* This empty div will be used for auto-scrolling */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
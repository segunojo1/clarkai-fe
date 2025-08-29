'use client'

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from "@/lib/types";
import type { FileAttachment as FileAttachmentType } from '@/lib/types';
import { ChevronRight, FileText, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFViewer } from './pdf-viewer';
import UserAvatar from '../user-avatar';
import { cn } from '@/lib/utils';
import { useSidebar } from '../ui/sidebar';
import MarkdownRenderer from '../markdown-renderer';
import { useWorkspaceStore } from '@/store/workspace.store';
import chatService from '@/services/chat.service';

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

  const getFileUrl = async () => {
    // if (file.url) {
    //   const resp = await chatService.getObjectUrlFromLink(file.url)
    //   console.log(resp);
      
    // }
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
        {
           (
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
          )
        }
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
  const {setSelectedFlashcards, setIsFlashcardModalOpen, setSelectedFlashcardId} = useWorkspaceStore()
  // const [selectedFlashcards, setSelectedFlashcards] = useState<FlashcardData[]>([]);
  // const [isFlashcardModalOpen, setIsFlashcardModalOpen] = useState(false);
  // const [selectedFlashcardId, setSelectedFlashcardId] = useState<string | null>(null);

  // const handleFlashcardClick = async (message: ChatMessage) => {
  //   if (message.metadata?.type === 'flashcards') {
  //     setSelectedFlashcards(message.metadata.data);
  //     setIsFlashcardModalOpen(true);
  //   } else if (message.fromUser && message.text.includes('@flashcard')) {
  //     // Show loading state
  //     const context = message.text.replace(/@flashcard\s*/g, '').trim();
  //     setSelectedFlashcards([{
  //       question: `Loading flashcards...`,
  //       answer: 'Please wait while we fetch your flashcards',
  //       explanation: 'This may take a moment'
  //     }]);
  //     setIsFlashcardModalOpen(true);

  //     try {
  //       // Get workspace ID from the URL
  //       const workspaceId = window.location.pathname.split('/').pop();
  //       if (!workspaceId) throw new Error('Workspace ID not found');

  //       // Fetch flashcards from the workspace
  //       const workspaceService = (await import('@/services/workspace.service')).default;
  //       const flashcards = await workspaceService.fetchWorkspaceFlashcards(workspaceId);
        
  //       if (flashcards && flashcards.length > 0) {
  //         // Transform the API response to match the FlashcardData format
  //         const formattedFlashcards = flashcards.map((card: any) => ({
  //           question: `Flashcard ${card.id.substring(0, 8)}`,
  //           answer: `Created on: ${new Date(card.createdAt).toLocaleDateString()}`,
  //           explanation: `Workspace: ${card.workspaceId}`
  //         }));
          
  //         setSelectedFlashcards(formattedFlashcards);
  //       } else {
  //         setSelectedFlashcards([{
  //           question: 'No Flashcards Found',
  //           answer: 'There are no flashcards available for this workspace yet.',
  //           explanation: 'Try generating some flashcards first!'
  //         }]);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching flashcards:', error);
  //       setSelectedFlashcards([{
  //         question: 'Error Loading Flashcards',
  //         answer: 'Failed to load flashcards. Please try again later.',
  //         explanation: error instanceof Error ? error.message : 'Unknown error occurred'
  //       }]);
  //     }
  //   }
  // };

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
          const isFlashcardMessage = message.metadata?.type === 'flashcards' || 
            (message.fromUser && message.text.includes('@flashcard')) || 
            (!message.fromUser && message.text.includes('Flashcard'));
          
          return (
            <div key={`${message.role}`} className={cn({
              ' rounded-lg transition-colors': isFlashcardMessage
            })}
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

                  {
                    message.isFile && message.fromUser && !message.attachments && (
                      <FileAttachmentPreview file={{name: message.text,
                        type: message.filePath,
                        url:message.filePath,
                        size: message.size}} />
                    )
                  }

                  {message.text && !message.filePath && (
                    <div className={`relative group rounded-[69px] p-4 ${message.fromUser ? 'bg-[#F0F0EF] dark:bg-[#404040] dark:text-white text-black' : 'bg-transparent'}`}>
                      {message.fromUser ? (
                        <p className="whitespace-pre-wrap break-words">
                          {message.text.split(/(@\w+)/).map((part, i) => {
                            // Only process non-empty parts
                            if (!part) return null;
                            return part.startsWith('@') ? (
                              <span key={i} className="bg-[#FCC095] bg-opacity-10 text-[#FF3C00] px-1.5 py-0.5 rounded-[2.8px] font-bold">
                                {part}
                              </span>
                            ) : (
                              <span key={i}>{part}</span>
                            );
                          })}
                        </p>
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
              {isFlashcardMessage && message.isFlashcard && message.flashcardId && (
                <div 
                  className="mt-2 ml-14 mb-4 cursor-pointer"
                  onClick={() => {
                    console.log('Opening flashcard with ID:', message.flashcardId);
                    setSelectedFlashcards([]);
                    setSelectedFlashcardId(message.flashcardId);
                    setIsFlashcardModalOpen(true);
                  }}
                > 
                  <div className="bg-gray-50 p-4 border border-[#d4d4d439] w-fit rounded-[10px] dark:bg-[#2C2C2C] hover:bg-gray-100 dark:hover:bg-[#4a4a4a] transition-colors">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-[#D4D4D4] mb-2">
                      Flashcard Pack Generated
                    </h4>
                    <div className="mt-[10px]">
                      <div className="text-sm font-bold gap-1 flex items-center dark:text-[#D4D4D4] w-fit p-[6px] bg-[#404040] text-center rounded-[4px]">
                        <Link width={16} className="mr-1" /> Open Flashcards
                      </div>
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

        
        {/* <FlashcardPanel 
          isOpen={isFlashcardModalOpen} 
          onClose={() => {
            setIsFlashcardModalOpen(false);
            setSelectedFlashcardId(null);
          }} 
          flashcards={selectedFlashcards}
          flashcardId={selectedFlashcardId}
        /> */}

        {/* This empty div will be used for auto-scrolling */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

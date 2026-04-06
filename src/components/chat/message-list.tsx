"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChatMessage } from "@/lib/types";
import type { FileAttachment as FileAttachmentType } from "@/lib/types";
import {
  ChevronRight,
  Copy,
  FileText,
  Link as LinkIcon,
  StopCircle,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFViewer } from "./pdf-viewer";
import { cn } from "@/lib/utils";
import { useSidebar } from "../ui/sidebar";
import MarkdownRenderer from "../markdown-renderer";
import { useWorkspaceStore } from "@/store/workspace.store";
import Link from "next/link";

const FileAttachmentPreview = ({
  file,
}: {
  file: FileAttachmentType | File;
}) => {
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const fileUrlRef = useRef<string>("");
  const { setOpen } = useSidebar();

  useEffect(() => {
    const createObjectUrl = () => {
      // Clean up previous URL if it exists
      if (fileUrlRef.current) {
        URL.revokeObjectURL(fileUrlRef.current);
        fileUrlRef.current = "";
      }

      if (!file) return;

      try {
        // If it's a File object
        if (file instanceof File) {
          fileUrlRef.current = URL.createObjectURL(file);
        }
        // If it's a FileAttachment with data
        else if ("type" in file) {
          const blob = new Blob([], { type: file.type });
          fileUrlRef.current = URL.createObjectURL(blob);
        }
      } catch (error) {
        console.error("Error creating file URL:", error);
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
    setOpen(false);
  };

  if (!file) return null;

  const getFileUrl = () => {
    // if (file.url) {
    //   const resp = chatService.getObjectUrlFromLink(file.url)
    //   console.log(resp);

    // }
    if (file instanceof File) {
      return fileUrlRef.current || URL.createObjectURL(file);
    }
    if ("url" in file && file.url) {
      return file.url;
    }
    return fileUrlRef.current;
  };

  return (
    <>
      <div className="mt-2 flex flex-col items-start gap-2">
        {
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
        }
        <div className="bg-gray-50 p-3 rounded-lg dark:bg-[#404040] flex flex-col items-center gap-2">
          <div className="flex-1 flex gap-2 min-w-0">
            <FileText className="text-[#FF3D00]" size={20} />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {file.name}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {file.size ? `${(file.size / 1024).toFixed(1)} KB` : ""}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 px-0"
              onClick={() => {
                const url = getFileUrl();
                if (url) window.open(url, "_blank");
              }}
            >
              Open
            </Button>
          </div>
        </div>
      </div>

      {showPdfViewer && (
        <PDFViewer
          file={
            file instanceof File
              ? file
              : "url" in file && file.url
                ? file.url
                : new File([], file.name, { type: file.type })
          }
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

// Simple read-aloud using the Web Speech API
const readAloud = (text: string) => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    console.warn("Speech synthesis not supported in this environment.");
    return;
  }
  const synth = window.speechSynthesis;
  // If already speaking, stop first to avoid overlap
  if (synth.speaking) synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.lang = navigator.language || "en-US";
  synth.speak(utterance);
};

// Convert markdown to plain text for clean TTS
const markdownToPlainText = (md: string): string => {
  if (!md) return "";
  let s = md;
  // Remove code blocks
  s = s.replace(/```[\s\S]*?```/g, "");
  // Inline code
  s = s.replace(/`([^`]+)`/g, "$1");
  // Images ![alt](url) -> alt
  s = s.replace(/!\[([^\]]*)\]\([^\)]*\)/g, "$1");
  // Links [text](url) -> text
  s = s.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, "$1");
  // Headings: remove leading #
  s = s.replace(/^\s{0,3}#{1,6}\s*/gm, "");
  // Blockquotes
  s = s.replace(/^>\s?/gm, "");
  // Lists/bullets
  s = s.replace(/^\s*[-*+]\s+/gm, "");
  s = s.replace(/^\s*\d+\.\s+/gm, "");
  // Emphasis/bold/strikethrough
  s = s.replace(/[\*_~]{1,3}([^\*_~]+)[\*_~]{1,3}/g, "$1");
  // HTML tags
  s = s.replace(/<[^>]+>/g, "");
  // Collapse spaces
  s = s
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return s;
};

export function ChatMessageList({
  messages,
  isLoading,
  onSuggestedQuestionClick,
  className,
}: {
  messages: ChatMessage[];
  isLoading: boolean;
  onSuggestedQuestionClick?: (question: string) => void;
  className?: string;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [speakingText, setSpeakingText] = useState<string | null>(null);
  const {
    setSelectedFlashcards,
    setIsFlashcardModalOpen,
    setSelectedFlashcardId,
    isQuizPanelOpen,
    setIsQuizPanelOpen,
  } = useWorkspaceStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const stopReading = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const synth = window.speechSynthesis;
      if (synth.speaking) synth.cancel();
    }
    setSpeakingText(null);
  };

  const handleReadAloud = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      console.warn("Speech synthesis not supported in this environment.");
      return;
    }
    const synth = window.speechSynthesis;
    if (synth.speaking) synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = navigator.language || "en-US";
    utterance.onend = () => setSpeakingText(null);
    utterance.onerror = () => setSpeakingText(null);
    setSpeakingText(text);
    synth.speak(utterance);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div
      className={cn(
        "w-full max-w-[734px] px-4 flex flex-col space-y-4 mx-auto flex-1 min-h-0",
        className,
      )}
    >
      <div className="w-full">
        {messages.map((message, index) => {
          const isFlashcardMessage =
            message.metadata?.type === "flashcards" ||
            (message.fromUser && message.text.includes("@flashcard")) ||
            (!message.fromUser && message.text.includes("Flashcard"));
          const isMaterialMessage =
            !!message.isGeneratedMaterial && !!message.attachments?.length;
          const cleanedText = markdownToPlainText(message.text);
          const isSpeakingThis = speakingText === cleanedText;

          return (
            <div
              key={`${message.role}-${index}`}
              className={cn({
                " rounded-lg transition-colors": isFlashcardMessage,
              })}
            >
              <div
                className={`flex flex-col items-${message.fromUser ? "end" : "start"} text-[15px] satoshi font-normal mb-4 w-full`}
              >
                <div
                  className={`flex flex-col ${message.fromUser ? "items-end" : "items-start"} w-full gap-2`}
                >
                  {!message.isGeneratedMaterial &&
                    message.attachments?.map((file, fileIndex) => (
                      <div
                        key={fileIndex}
                        className={`w-full rounded-2xl ${message.fromUser ? "" : "bg-gray-100 dark:bg-gray-800"}`}
                      >
                        <FileAttachmentPreview file={file} />
                      </div>
                    ))}

                  {message.isFile &&
                    message.fromUser &&
                    !message.attachments && (
                      <FileAttachmentPreview
                        file={{
                          name: message.text,
                          type: "application/octet-stream",
                          url: message.filePath ?? undefined,
                          size: message.size ?? undefined,
                        }}
                      />
                    )}

                  {!isMaterialMessage && message.text && !message.filePath && (
                    <div
                      className={`relative group rounded-[69px] p-4 max-w-full  ${message.fromUser ? "bg-[#F0F0EF] dark:bg-[#404040] dark:text-white text-black" : "bg-transparent"}`}
                    >
                      {message.fromUser ? (
                        <p className="whitespace-pre-wrap break-words max-w-full">
                          {message.text.split(/(@\w+)/).map((part, i) => {
                            if (!part) return null;
                            return part.startsWith("@") ? (
                              <span
                                key={i}
                                className="bg-[#FCC095] satoshi bg-opacity-10 text-[#FF3C00] px-1.5 py-0.5 rounded-[2.8px] font-bold"
                              >
                                {part}
                              </span>
                            ) : (
                              <span key={i} className="satoshi">
                                {part}
                              </span>
                            );
                          })}
                        </p>
                      ) : (
                        <div className="markdown-body text-black dark:text-white max-w-full overflow-x-auto break-words">
                          <MarkdownRenderer content={message.text} />
                        </div>
                      )}

                      <div className="absolute right-0 mt-1 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => copyToClipboard(message.text)}
                          title="Copy"
                          aria-label="Copy"
                          className="inline-flex items-center justify-center h-8 w-8 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/70 dark:hover:bg-gray-700/70 border border-transparent hover:border-gray-300/60 dark:hover:border-gray-600/60 transition-colors"
                        >
                          <Copy width={16} height={16} />
                        </button>
                        <button
                          onClick={() =>
                            isSpeakingThis
                              ? stopReading()
                              : handleReadAloud(cleanedText)
                          }
                          className="inline-flex items-center justify-center h-8 w-8 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/70 dark:hover:bg-gray-700/70 border border-transparent hover:border-gray-300/60 dark:hover:border-gray-600/60 transition-colors"
                          title={isSpeakingThis ? "Stop" : "Read aloud"}
                          aria-label={isSpeakingThis ? "Stop" : "Read aloud"}
                        >
                          {isSpeakingThis ? (
                            <StopCircle width={16} height={16} />
                          ) : (
                            <Volume2 width={16} height={16} />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {message.follow_up_suggestions &&
                    message.follow_up_suggestions.length > 0 &&
                    onSuggestedQuestionClick &&
                    !isLoading && (
                      <div className="mt-3 w-full max-w-[680px] rounded-2xl border border-gray-200/70 bg-gray-50/70 p-3 dark:border-gray-700 dark:bg-[#2f2f2f]/60">
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Suggested follow-ups
                        </p>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {message.follow_up_suggestions.map(
                            (suggestion, i) => (
                              <button
                                key={i}
                                onClick={() =>
                                  onSuggestedQuestionClick(suggestion)
                                }
                                className="group w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-left text-xs font-medium text-gray-700 transition-all hover:-translate-y-[1px] hover:border-[#FF3D00] hover:text-[#FF3D00] hover:shadow-sm dark:border-gray-600 dark:bg-[#333] dark:text-gray-300 dark:hover:bg-[#3a3a3a]"
                              >
                                <span className="line-clamp-2">
                                  {suggestion}
                                </span>
                              </button>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  {isMaterialMessage && (
                    <div className="mt-1 mb-2 w-full max-w-md rounded-[10px] border border-[#d4d4d439] bg-[#BCB3B0] p-4 dark:bg-[#2C2C2C]">
                      <h4 className="mb-2 text-sm font-bold text-gray-900 dark:text-[#D4D4D4]">
                        Material Generated
                      </h4>
                      <p className="mb-2 text-xs text-gray-700 dark:text-gray-300">
                        {message.materialTitle ||
                          "Your material is ready as a readable PDF."}
                      </p>
                      {message.attachments?.[0] && (
                        <FileAttachmentPreview file={message.attachments[0]} />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {isFlashcardMessage &&
                message.isFlashcard &&
                message.flashcardId && (
                  <div
                    className="mt-2 ml-14 mb-4 cursor-pointer"
                    onClick={() => {
                      setSelectedFlashcards([]);
                      setSelectedFlashcardId(message.flashcardId as string);
                      setIsFlashcardModalOpen(true);
                      setIsQuizPanelOpen(false);
                    }}
                  >
                    <div className=" bg-[#BCB3B0] p-4 border border-[#d4d4d439] w-fit rounded-[10px] dark:bg-[#2C2C2C] hover:bg-gray-100 dark:hover:bg-[#4a4a4a] transition-colors">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-[#D4D4D4] mb-2">
                        Flashcard Pack Generated
                      </h4>
                      <div className="mt-[10px]">
                        <div className="text-sm font-bold gap-1 flex items-center dark:text-[#D4D4D4] w-fit p-[6px] bg-[#404040] text-center rounded-[4px]">
                          <LinkIcon width={16} className="mr-1" /> Open
                          Flashcards
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {message.isQuiz && message.quizId && (
                <div
                  className="mt-2 ml-14 mb-4 cursor-pointer "
                  onClick={() => setIsQuizPanelOpen(false)}
                >
                  <div className=" bg-[#BCB3B0] min-w-[200px] p-4 border border-[#d4d4d439] w-fit rounded-[10px] dark:bg-[#2C2C2C] dark:hover:bg-gray-100 hover:bg-[#4a4a4a] transition-colors">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-[#D4D4D4] mb-2">
                      Quiz Generated
                    </h4>
                    <div className="mt-[10px]">
                      <div className="text-sm font-bold gap-1 flex items-center dark:text-[#D4D4D4] w-full p-[6px] bg-[#404040] text-center rounded-[4px]">
                        <Link
                          href={`/quiz/${message.quizId}`}
                          className="flex items-center gap-1"
                        >
                          <LinkIcon width={16} className="mr-1" /> Open Quiz
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {message.text === "Generating flashcards..." && (
                <div className="mt-2 ml-14">
                  <div className="bg-gray-50 p-4 rounded-lg dark:bg-[#404040] flex flex-col items-center gap-2">
                    <div className="flex-1 flex gap-2 min-w-0">
                      <div className="bg-primary/10 text-primary p-1.5 rounded-md">
                        ...
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
          <div className="flex items-center justify-center py-4">
            <div className="flex gap-2">
              <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
              <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse delay-100"></div>
              <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse delay-200"></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

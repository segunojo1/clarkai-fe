"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useRef } from "react";
import ChatInputForm from "@/components/home/chat-input-form";
import { ChatMessageList } from "@/components/chat/message-list";
import { useChatStore } from "@/store/chat.store";
import { toast } from "sonner";
import { ChatMessage } from "@/lib/types";
import workspaceServiceInstance from "@/services/workspace.service";
import chatServiceInstance from "@/services/chat.service";
import { useWorkspaceStore } from "@/store/workspace.store";
import { UploadMaterialModal } from "@/components/home/upload-material-modal";
import Image from "next/image";
import { SlidingPanel } from "@/components/ui/sliding-panel";
import { Edit, Loader2 } from "lucide-react";
import quizService from "@/services/quiz.service";
import UserAvatar from "@/components/user-avatar";
import { pdf } from "@react-pdf/renderer";
import MaterialPdf from "@/components/home/MaterialPdf";

export default function WorkspacePage() {
  const { setCurrentChatId, setChatDetails, setIsLoading, isLoading } =
    useChatStore();
  const {
    messages,
    setMessages,
    askQuestion,
    isQuizPanelOpen,
    setIsQuizPanelOpen,
    selectedWorkspace,
    renameWorkspace,
    suggestedQuestions,
    fetchSuggestedQuestions,
  } = useWorkspaceStore();
  // const [isLoading, setIsLoading] = useState(false)
  const [loadChats, setLoadChats] = useState(false);
  const [isRenamingWorkspace, setIsRenamingWorkspace] = useState(false);
  const [workspaceNameInput, setWorkspaceNameInput] = useState("");
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  // const searchParams = useSearchParams()
  // const [isQuizPanelOpen, setIsQuizPanelOpen] = useState(false)
  const [askSource, setAskSource] = useState<"ai" | "materials">("materials");
  const [showUploadGuide, setShowUploadGuide] = useState(false);
  const uploadButtonRef = useRef<HTMLButtonElement>(null);
  const fetchedWorkspaceRef = useRef<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const storageKey = `workspace-upload-guide-seen:${id}`;
    const hasSeenGuide =
      typeof window !== "undefined" && window.localStorage.getItem(storageKey);

    if (!hasSeenGuide) {
      setShowUploadGuide(true);
    }
  }, [id]);

  const dismissUploadGuide = () => {
    if (!id || typeof window === "undefined") return;

    window.localStorage.setItem(`workspace-upload-guide-seen:${id}`, "true");
    setShowUploadGuide(false);
  };

  useEffect(() => {
    const handleQuizPanelEvent = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.workspaceId === id) {
        setIsQuizPanelOpen(true);
      }
    };

    window.addEventListener("openQuizPanel", handleQuizPanelEvent);
    return () => {
      window.removeEventListener("openQuizPanel", handleQuizPanelEvent);
    };
  }, [id]);

  const handleCloseQuizPanel = () => {
    setIsQuizPanelOpen(false);
  };

  useEffect(() => {
    setCurrentChatId(id as string | null);
  }, [id, setCurrentChatId]);

  useEffect(() => {
    if (id) {
      fetchSuggestedQuestions(id.toString());
    }
  }, [id, fetchSuggestedQuestions]);

  useEffect(() => {
    if (!id) return;

    if (fetchedWorkspaceRef.current === id) return;

    const getWorkspaceChat = async () => {
      try {
        setLoadChats(true);
        const workspace = await workspaceServiceInstance.getWorkspaces(
          id.toString(),
        );

        // Set workspace in store
        useWorkspaceStore.getState().selectWorkspace(workspace);

        // Get messages using chat ID from workspace response
        const chatId = workspace.chat?.id;
        if (!chatId) {
          throw new Error("No chat ID found for workspace");
        }

        const response = await chatServiceInstance.getChat(1, chatId);

        setChatDetails(response);
        if (response.messages) {
          setMessages(response.messages);
          // mark as fetched successfully for this workspace
          fetchedWorkspaceRef.current = id;
        } else {
          throw new Error("Failed to fetch messages");
        }
      } catch (error) {
        toast("Error: Cant find workspace chat");
        console.error(error);
        router.push("/workspaces");
      } finally {
        setLoadChats(false);
      }
    };

    getWorkspaceChat();
  }, [id, askQuestion]);

  interface FlashcardQuestion {
    question: string;
    answer: string;
    explanation?: string;
  }

  interface FlashcardResponse {
    flashcard_id: string;
    message: string;
    questions: FlashcardQuestion[];
    success: boolean;
  }

  const handleGenerateFlashcards = useCallback(
    async (context: string) => {
      if (!context.trim() || !id) return Promise.resolve();

      // Create loading message ID at the start of the function
      const loadingMessageId = `loading-${Date.now()}`;
      let updatedMessages = [...messages];

      try {
        setIsLoading(true);

        // Add user message
        const userMessage: ChatMessage = {
          id: `user-${Date.now()}`,
          role: "user",
          text: `${context}`,
          fromUser: true,
          isFile: false,
          isFlashcard: true,
          flashcardId: "",
          size: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Update messages with the new user message
        updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);

        // Add loading message
        const loadingMessage: ChatMessage = {
          id: loadingMessageId,
          role: "assistant",
          text: "Generating flashcards...",
          fromUser: false,
          isFile: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          isFlashcard: true,
          flashcardId: "",
          size: 10,
        };

        // Update messages with loading state
        updatedMessages = [...updatedMessages, loadingMessage];
        setMessages(updatedMessages);

        // Call the API to generate flashcards
        const response = await useWorkspaceStore
          .getState()
          .generateFlashcards("workspace", id, 10, true, context);

        const flashcardResponse = response as unknown as FlashcardResponse;

        if (flashcardResponse.success && flashcardResponse.questions) {
          const flashcards = flashcardResponse.questions.map(
            (card: FlashcardQuestion) => ({
              question: card.question,
              answer: card.answer,
              explanation: card.explanation || "",
            }),
          );

          const assistantMessage: ChatMessage = {
            createdAt: new Date(),
            filePath: null,
            flashcardId: flashcardResponse.flashcard_id,
            role: "assistant",
            text: `I've generated ${flashcards.length} flashcards based on: "${context}"`,
            fromUser: false,
            isFile: false,
            isFlashcard: true,
            size: 0,

            updatedAt: new Date(),
            metadata: {
              type: "flashcards",
              data: flashcards,
            },
          };

          // Update messages by replacing the loading message with the actual flashcards
          updatedMessages = [
            ...updatedMessages.filter((msg) => msg.id !== loadingMessageId),
            assistantMessage,
          ];
          setMessages(updatedMessages);
        }

        return Promise.resolve();
      } catch (error) {
        console.error("Error generating flashcards:", error);
        toast.error("Failed to generate flashcards");

        // Update messages by removing the loading message
        updatedMessages = updatedMessages.filter(
          (msg) => msg.id !== loadingMessageId,
        );
        setMessages(updatedMessages);

        return Promise.reject(error);
      } finally {
        setIsLoading(false);
      }
    },
    [id, messages, setIsLoading, setMessages],
  );

  const handleGenerateMaterials = useCallback(
    async (context: string) => {
      if (!context.trim() || !id) return Promise.resolve();

      const loadingMessageId = `loading-${Date.now()}`;
      let updatedMessages = [...messages];

      try {
        setIsLoading(true);

        // Add user message to chat
        const userMessage: ChatMessage = {
          id: `user-${Date.now()}`,
          role: "user",
          text: context,
          fromUser: true,
          isFile: false,
          isFlashcard: false,
          flashcardId: null,
          size: null,
        };

        updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);

        // Add placeholder "loading" assistant message
        const loadingMessage: ChatMessage = {
          id: loadingMessageId,
          role: "assistant",
          text: "Generating study material...",
          fromUser: false,
          isFile: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          flashcardId: "",
          size: 0,
          isFlashcard: false,
        };

        updatedMessages = [...updatedMessages, loadingMessage];
        setMessages(updatedMessages);

        // Call your API to generate material
        // Example: call workspaceServiceInstance.generateMaterial with defaults (topic mode)
        const response = await workspaceServiceInstance.generateMaterial(
          context,
          "500-1000",
          true,
          context,
          undefined,
        );

        if (response?.text) {
          const materialTitle = `Generated Material - ${new Date().toLocaleDateString()}`;
          const materialPdfBlob = await pdf(
            <MaterialPdf content={response.text} title={materialTitle} />,
          ).toBlob();
          const materialPdfUrl = URL.createObjectURL(materialPdfBlob);

          const assistantMessage: ChatMessage = {
            createdAt: new Date(),
            role: "assistant",
            text: "Material generated successfully.",
            fromUser: false,
            isFile: false,
            updatedAt: new Date(),
            flashcardId: "",
            size: 0,
            isFlashcard: false,
            isGeneratedMaterial: true,
            materialTitle,
            attachments: [
              {
                name: `${materialTitle}.pdf`,
                type: "application/pdf",
                url: materialPdfUrl,
                size: materialPdfBlob.size,
              },
            ],
          };

          updatedMessages = [
            ...updatedMessages.filter((msg) => msg.id !== loadingMessageId),
            assistantMessage,
          ];
          setMessages(updatedMessages);
        } else {
          toast.error("Failed to generate material");
          updatedMessages = updatedMessages.filter(
            (msg) => msg.id !== loadingMessageId,
          );
          setMessages(updatedMessages);
        }

        return Promise.resolve();
      } catch (error) {
        console.error("Error generating materials:", error);
        toast.error("Failed to generate materials");
        updatedMessages = updatedMessages.filter(
          (msg) => msg.id !== loadingMessageId,
        );
        setMessages(updatedMessages);
        return Promise.reject(error);
      } finally {
        setIsLoading(false);
      }
    },
    [id, messages, setIsLoading, setMessages],
  );

  const handleGenerateQuiz = async (messageText: string) => {
    const loadingMessageId = `loading-${Date.now()}`;
    let updatedMessages = [...messages];
    try {
      const numQuestions = 5;
      const difficulty: "easy" | "medium" | "hard" = "medium";
      const mode: "workspace" | "file" = "workspace";

      setIsLoading(true);

      // Add user message to chat
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        text: messageText,
        fromUser: true,
        isFile: false,
        isFlashcard: false,
        flashcardId: null,
        size: null,
      };

      updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      // Add placeholder "loading" assistant message
      const loadingMessage: ChatMessage = {
        id: loadingMessageId,
        role: "assistant",
        text: "Generating quiz...",
        fromUser: false,
        isFile: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        flashcardId: "",
        size: 0,
        isFlashcard: false,
      };

      updatedMessages = [...updatedMessages, loadingMessage];
      setMessages(updatedMessages);

      const response = await quizService.generateQuiz({
        workspace_id: id.toString(),
        size: numQuestions,
        name: messageText,
        mode,
        file_id: undefined,
        difficulty,
        duration: 10,
        context: messageText,
        is_context: true,
      });

      if (response?.quiz_id) {
        // Add assistant message with generated material
        const assistantMessage: ChatMessage = {
          createdAt: new Date(),
          role: "assistant",
          text: "I've generated a quiz ",
          fromUser: false,
          isFile: false,
          updatedAt: new Date(),
          flashcardId: "",
          size: 0,
          isFlashcard: false,
          isQuiz: true,
          quizId: response.quiz_id,
        };

        updatedMessages = [
          ...updatedMessages.filter((msg) => msg.id !== loadingMessageId),
          assistantMessage,
        ];
        setMessages(updatedMessages);
      }
      toast.success("Quiz generated successfully!");
    } catch (err) {
      console.error("Failed to generate quiz:", err);
      updatedMessages = updatedMessages.filter(
        (msg) => msg.id !== loadingMessageId,
      );
      setMessages(updatedMessages);
      toast.error("Failed to generate quiz");
    } finally {
      setIsLoading(false);
    }
  };

  //SEGUN COME HERE AND ADD FILES ARG HERE LATER
  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    if (id) {
      try {
        setIsLoading(true);

        // Remove suggested questions message from the list
        setMessages(
          messages.filter((msg) => msg.id !== "suggested-questions-prompt"),
        );

        // Detect @file[filename] tag and resolve fileId from workspace files (fallback to legacy @file(id))
        const fileLabelMatch = text.match(/@file\[([^\]]+)\]/);
        const fileLabel = fileLabelMatch?.[1]?.trim();
        const workspaceFiles = selectedWorkspace?.workspace?.files;
        const allWorkspaceFiles = [
          ...(workspaceFiles?.pdfFiles ?? []),
          ...(workspaceFiles?.imageFiles ?? []),
          ...(workspaceFiles?.youtubeVideos ?? []),
        ];
        const matchedWorkspaceFile = fileLabel
          ? allWorkspaceFiles.find((f) => {
              const file = f as {
                fileName?: string;
                title?: string;
              };
              const name = (file.fileName || file.title || "").trim();
              return name.toLowerCase() === fileLabel.toLowerCase();
            })
          : undefined;
        const resolvedFileId = matchedWorkspaceFile
          ? (matchedWorkspaceFile as { id?: string; videoId?: string }).id ||
            (matchedWorkspaceFile as { id?: string; videoId?: string }).videoId
          : undefined;

        const legacyFileTagMatch = text.match(/@file\(([^)]+)\)/);
        const fileId = resolvedFileId || legacyFileTagMatch?.[1];
        const recentMessages = messages.slice(-10);

        const mode: "workspace" | "file" | "internet" = fileId
          ? "file"
          : askSource == "ai"
            ? "internet"
            : "workspace";

        const resp = await useWorkspaceStore
          .getState()
          .askQuestion(id.toString(), text, true, mode, recentMessages, fileId);
        await fetchSuggestedQuestions(id.toString());
      } catch (error) {
        console.error("Error sending message:", error);
        toast("Error: Failed to send message");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRenameWorkspace = async () => {
    if (!workspaceNameInput.trim() || !id) {
      toast.error("Workspace name cannot be empty");
      return;
    }

    try {
      await renameWorkspace(id.toString(), workspaceNameInput.trim());
      toast.success("Workspace renamed successfully!");
      setIsRenamingWorkspace(false);
      setWorkspaceNameInput("");
    } catch (error) {
      console.error("Error renaming workspace:", error);
      toast.error("Failed to rename workspace");
    }
  };

  const suggestedPromptMessage: ChatMessage | null =
    messages.length > 0 && suggestedQuestions.length > 0 && !isLoading
      ? {
          id: "suggested-questions-prompt",
          role: "assistant",
          text: "You can continue with one of these:",
          fromUser: false,
          isFile: false,
          isFlashcard: false,
          flashcardId: null,
          size: null,
          follow_up_suggestions: suggestedQuestions,
        }
      : null;

  return (
    <div className="flex flex-col h-screen w-full">
      <div className={`flex flex-col h-screen justify-between pb-12 w-full`}>
        <div className="flex items-center h-fit p-4 justify-between w-full dark:bg-[#1a1a1a] bg-[#f1f1f1] border-b border-gray-700">
          <div className="items-center gap-4 flex ">
            <UserAvatar />
            {isRenamingWorkspace ? (
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={workspaceNameInput}
                  onChange={(e) => setWorkspaceNameInput(e.target.value)}
                  placeholder={
                    selectedWorkspace?.workspace?.name || "Workspace name"
                  }
                  className="text-2xl font-bold bg-gray-700 text-white px-3 py-2 rounded border border-gray-500 focus:outline-none focus:border-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRenameWorkspace();
                    if (e.key === "Escape") setIsRenamingWorkspace(false);
                  }}
                />
                <button
                  onClick={handleRenameWorkspace}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsRenamingWorkspace(false)}
                  className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex gap-2 items-center">
                <h1 className="text-2xl font-bold dark:text-white text-black">
                  Workspace - {selectedWorkspace?.workspace?.name}
                </h1>
                <button
                  onClick={() => {
                    setIsRenamingWorkspace(true);
                    setWorkspaceNameInput(
                      selectedWorkspace?.workspace?.name || "",
                    );
                  }}
                  className="text-gray-400 hover:text-gray-200 transition-colors"
                  title="Click to rename workspace"
                >
                  <Edit />
                </button>
              </div>
            )}
          </div>
          <UploadMaterialModal workspaceId={id.toString()}>
            <button
              ref={uploadButtonRef}
              className="p-1 border-2 rounded-full border-[#ffffff] transition-colors"
              onClick={dismissUploadGuide}
            >
              <Image
                src="/globe.svg"
                alt="Globe"
                width={20}
                height={20}
                className="w-5 h-5"
              />
            </button>
          </UploadMaterialModal>

          {showUploadGuide && uploadButtonRef.current && (
            <div className="fixed inset-0 z-[100] pointer-events-none">
              <div
                className="absolute rounded-full ring-4 ring-[#FF3D00]/30 animate-pulse"
                style={{
                  top: uploadButtonRef.current.getBoundingClientRect().top - 12,
                  left: uploadButtonRef.current.getBoundingClientRect().left - 12,
                  width: uploadButtonRef.current.getBoundingClientRect().width + 24,
                  height:
                    uploadButtonRef.current.getBoundingClientRect().height + 24,
                }}
              />
              <div
                className="absolute max-w-[260px] rounded-xl border border-[#FFD1C2] bg-white px-4 py-3 text-sm shadow-2xl"
                style={{
                  top:
                    uploadButtonRef.current.getBoundingClientRect().top + 38,
                  left:
                    Math.max(
                      16,
                      uploadButtonRef.current.getBoundingClientRect().left - 220,
                    ),
                }}
              >
                <div className="font-semibold text-[#FF3D00]">Upload materials here</div>
                <p className="mt-1 text-gray-600">
                  Drop in PDFs, images, or links to build this workspace before you chat.
                </p>
                <button
                  type="button"
                  className="pointer-events-auto mt-3 rounded-md bg-[#FF3D00] px-3 py-1.5 text-white"
                  onClick={dismissUploadGuide}
                >
                  Got it
                </button>
              </div>
            </div>
          )}
        </div>
        {loadChats ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pb-32">
            <ChatMessageList
              messages={
                suggestedPromptMessage
                  ? [...messages, suggestedPromptMessage]
                  : messages
              }
              isLoading={isLoading}
              onSuggestedQuestionClick={handleSend}
            />
          </div>
        )}
        <div className="flex-none sticky bottom-0 z-20 bg-transparent">
          <ChatInputForm
            askSource={askSource}
            setAskSource={setAskSource}
            onSend={handleSend}
            onGenerateFlashcards={handleGenerateFlashcards}
            disabled={isLoading}
            onGenerateMaterial={handleGenerateMaterials}
            onGenerateQuiz={handleGenerateQuiz}
          />
        </div>
      </div>
      <SlidingPanel
        isOpen={isQuizPanelOpen}
        onClose={handleCloseQuizPanel}
        workspaceId={id.toString()}
      />
    </div>
  );
}

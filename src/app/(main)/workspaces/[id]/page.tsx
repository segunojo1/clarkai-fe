"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import ChatInputForm from "@/components/home/chat-input-form";
import { WelcomeScreen } from "@/components/chat/welcome-screen";
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
import { Loader2 } from "lucide-react";
import quizService from "@/services/quiz.service";

// Helper function to format flashcards as markdown
// const formatFlashcards = (flashcards: Array<{ question: string, answer: string, explanation?: string }>) => {
//   return flashcards.map((card, index) =>
//     `### Flashcard ${index + 1}\n` +
//     `**Q:** ${card.question}\n` +
//     `**A:** ${card.answer}\n` +
//     (card.explanation ? `*${card.explanation}*\n\n` : '\n')
//   ).join('\n');
// };

export default function WorkspacePage() {
  const { setCurrentChatId, setChatDetails, setIsLoading, isLoading } =
    useChatStore();
  const {
    messages,
    setMessages,
    askQuestion,
    isQuizPanelOpen,
    setIsQuizPanelOpen,
  } = useWorkspaceStore();
  // const [isLoading, setIsLoading] = useState(false)
  const [loadChats, setLoadChats] = useState(false);
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  // const searchParams = useSearchParams()
  // const [isQuizPanelOpen, setIsQuizPanelOpen] = useState(false)
  const [askSource, setAskSource] = useState<"ai" | "materials">("materials");

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
  console.log(messages);

  useEffect(() => {
    if (id) {
      const getWorkspaceChat = async () => {
        try {
          setLoadChats(true);
          const workspace = await workspaceServiceInstance.getWorkspaces(
            id.toString()
          );

          // Set workspace in store
          useWorkspaceStore.getState().selectWorkspace(workspace);

          // Set chat details from workspace
          console.log(workspace);

          // Get messages using chat ID from workspace response
          const chatId = workspace.chat?.id;
          if (!chatId) {
            throw new Error("No chat ID found for workspace");
          }

          const response = await chatServiceInstance.getChat(1, chatId);
          console.log(response);
          setLoadChats(false);
          setChatDetails(response);
          if (response.messages) {
            setMessages(response.messages);
          } else {
            throw new Error("Failed to fetch messages");
          }
        } catch (error) {
          toast("Error: Cant find workspace chat");
          console.error(error);
          router.push("/workspaces");
        }
      };

      getWorkspaceChat();
    }
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
        const response = await useWorkspaceStore.getState().generateFlashcards(
          "workspace",
          id,
          10, // Default number of flashcards
          true,
          context
        );

        const flashcardResponse = response as unknown as FlashcardResponse;

        if (flashcardResponse.success && flashcardResponse.questions) {
          // Create structured flashcard data
          const flashcards = flashcardResponse.questions.map(
            (card: FlashcardQuestion) => ({
              question: card.question,
              answer: card.answer,
              explanation: card.explanation || "",
            })
          );

          // Add assistant message with flashcard data
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
        console.log(messages);

        return Promise.resolve();
      } catch (error) {
        console.error("Error generating flashcards:", error);
        toast.error("Failed to generate flashcards");

        // Update messages by removing the loading message
        updatedMessages = updatedMessages.filter(
          (msg) => msg.id !== loadingMessageId
        );
        setMessages(updatedMessages);

        return Promise.reject(error);
      } finally {
        setIsLoading(false);
      }
    },
    [id, messages, setIsLoading, setMessages]
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
          undefined
        );

        if (response?.text) {
          const assistantMessage: ChatMessage = {
            createdAt: new Date(),
            role: "assistant",
            text: response.text,
            fromUser: false,
            isFile: false,
            updatedAt: new Date(),
            flashcardId: "",
            size: 0,
            isFlashcard: false,
          };

          updatedMessages = [
            ...updatedMessages.filter((msg) => msg.id !== loadingMessageId),
            assistantMessage,
          ];
          setMessages(updatedMessages);
        } else {
          toast.error("Failed to generate material");
          updatedMessages = updatedMessages.filter(
            (msg) => msg.id !== loadingMessageId
          );
          setMessages(updatedMessages);
        }

        return Promise.resolve();
      } catch (error) {
        console.error("Error generating materials:", error);
        toast.error("Failed to generate materials");
        updatedMessages = updatedMessages.filter(
          (msg) => msg.id !== loadingMessageId
        );
        setMessages(updatedMessages);
        return Promise.reject(error);
      } finally {
        setIsLoading(false);
      }
    },
    [id, messages, setIsLoading, setMessages]
  );

  const handleGenerateQuiz = async (messageText: string) => {
    const loadingMessageId = `loading-${Date.now()}`;
    let updatedMessages = [...messages];
    try {
      // Default or parsed parameters (you could parse quizName, numQuestions, etc. from the message)
      const quizName = "New Quiz";
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
        (msg) => msg.id !== loadingMessageId
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
        // Detect @file(<id>) tag and extract fileId
        const fileTagMatch = text.match(/@file\(([^)]+)\)/);
        const fileId = fileTagMatch?.[1];
        // Remove the file tag from the text sent to the API
        const cleanedText = text.replace(/@file\(([^)]+)\)/g, '').trim();

        // Trim messages to the last 10 messages to limit context length
        const recentMessages = messages.slice(-10);

        const mode: 'workspace' | 'file' | 'internet' = fileId
          ? 'file'
          : (askSource == 'ai' ? 'internet' : 'workspace');

        const resp = await useWorkspaceStore
          .getState()
          .askQuestion(
            id.toString(),
            cleanedText || text,
            true,
            mode,
            recentMessages,
            fileId
          );
        console.log(resp);
      } catch (error) {
        console.error("Error sending message:", error);
        toast("Error: Failed to send message");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex h-full w-full !max-w-[calc(100vw-235px)] overflow-hidden">
      <div
        className={`flex flex-col h-full  justify-between pb-12 w-full ${
          isQuizPanelOpen ? "" : "min-w-full"
        }`}
      >
        <div className="absolute top-10 right-10 ">
          <UploadMaterialModal workspaceId={id.toString()}>
            <button className="p-1 border-2 rounded-full border-[#ffffff] transition-colors">
              <Image
                src="/globe.svg"
                alt="Globe"
                width={20}
                height={20}
                className="w-5 h-5"
              />
            </button>
          </UploadMaterialModal>
        </div>
        {/* <SlidingPanel
        isOpen={isQuizPanelOpen}
        onClose={handleCloseQuizPanel}
        workspaceId={id.toString()}
            /> */}
        {loadChats ? (
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="">
            {messages.length === 0 ? (
              <div className="mt-16">
                <WelcomeScreen onSend={handleSend} />
              </div>
            ) : (
              <ChatMessageList messages={messages} isLoading={isLoading} />
            )}
          </div>
        )}
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
      <SlidingPanel
        isOpen={isQuizPanelOpen}
        onClose={handleCloseQuizPanel}
        workspaceId={id.toString()}
      />
    </div>
  );
}

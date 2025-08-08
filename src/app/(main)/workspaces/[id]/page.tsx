"use client"

import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import ChatInputForm from '@/components/home/chat-input-form'
import { WelcomeScreen } from '@/components/chat/welcome-screen'
import { ChatMessageList } from '@/components/chat/message-list'
import { useChatStore } from '@/store/chat.store'
import { toast } from 'sonner'
import { ChatMessage } from '@/lib/types'
import workspaceServiceInstance from "@/services/workspace.service"
import chatServiceInstance from "@/services/chat.service"
import { useWorkspaceStore } from '@/store/workspace.store'
import { UploadMaterialModal } from '@/components/home/upload-material-modal'
import Image from 'next/image'
import { SlidingPanel } from '@/components/ui/sliding-panel'
import { Loader2 } from 'lucide-react'

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
  const { setCurrentChatId, setChatDetails } = useChatStore()
  const { messages, setMessages, isLoading, setIsLoading, askQuestion } = useWorkspaceStore()
  const [loadChats, setLoadChats] = useState(false);
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  // const searchParams = useSearchParams()
  const [isQuizPanelOpen, setIsQuizPanelOpen] = useState(false)

  useEffect(() => {
    const handleQuizPanelEvent = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.workspaceId === id) {
        setIsQuizPanelOpen(true)
      }
    }

    window.addEventListener('openQuizPanel', handleQuizPanelEvent)
    return () => {
      window.removeEventListener('openQuizPanel', handleQuizPanelEvent)
    }
  }, [id])

  const handleCloseQuizPanel = () => {
    setIsQuizPanelOpen(false)
  }

  useEffect(() => {
    setCurrentChatId(id as string | null)
  }, [id, setCurrentChatId])
  console.log(messages);

  useEffect(() => {
    if (id) {
      const getWorkspaceChat = async () => {
        try {
          setLoadChats(true)
          const workspace = await workspaceServiceInstance.getWorkspaces(id.toString())

          // Set workspace in store
          useWorkspaceStore.getState().selectWorkspace(workspace)

          // Set chat details from workspace
          console.log(workspace);

          // Get messages using chat ID from workspace response
          const chatId = workspace.chat?.id
          if (!chatId) {
            throw new Error('No chat ID found for workspace')
          }

          const response = await chatServiceInstance.getChat(1, chatId)
          console.log(response);
          setLoadChats(false)
          setChatDetails(response)
          if (response.messages) {
            setMessages(response.messages)
          } else {
            throw new Error('Failed to fetch messages')
          }
        } catch (error) {
          toast('Error: Cant find workspace chat')
          console.error(error)
          router.push('/workspaces')
        }
      }

      getWorkspaceChat()
    }
  }, [id, askQuestion])

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

  const handleGenerateFlashcards = useCallback(async (context: string) => {
    if (!context.trim() || !id) return Promise.resolve();

    // Create loading message ID at the start of the function
    const loadingMessageId = `loading-${Date.now()}`;
    let updatedMessages = [...messages];

    try {
      setIsLoading(true);

      // Add user message
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: `${context}`,
        fromUser: true,
        isFile: false,
        isFlashcard: true,
        flashcardId: '',
        size: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Update messages with the new user message
      updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      // Add loading message
      const loadingMessage: ChatMessage = {
        id: loadingMessageId,
        role: 'assistant',
        text: 'Generating flashcards...',
        fromUser: false,
        isFile: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        isFlashcard: true,
        
      };

      // Update messages with loading state
      updatedMessages = [...updatedMessages, loadingMessage];
      setMessages(updatedMessages);

      // Call the API to generate flashcards
      const response = await useWorkspaceStore.getState().generateFlashcards(
        'workspace',
        id,
        10, // Default number of flashcards
        true,
        context
      );

      const flashcardResponse = response as unknown as FlashcardResponse;

      if (flashcardResponse.success && flashcardResponse.questions) {
        // Create structured flashcard data
        const flashcards = flashcardResponse.questions.map((card: FlashcardQuestion) => ({
          question: card.question,
          answer: card.answer,
          explanation: card.explanation || ''
        }));

        // Add assistant message with flashcard data
        const assistantMessage: ChatMessage = {
          createdAt: new Date(),
          filePath: null,
          flashcardId: flashcardResponse.flashcard_id,
          role: 'assistant',
          text: `I've generated ${flashcards.length} flashcards based on: "${context}"`,
          fromUser: false,
          isFile: false,
          isFlashcard: true,
          size: 0,

          updatedAt: new Date(),
          metadata: {
            type: 'flashcards',
            data: flashcards
          }
        };

        // Update messages by replacing the loading message with the actual flashcards
        updatedMessages = [
          ...updatedMessages.filter(msg => msg.id !== loadingMessageId),
          assistantMessage
        ];
        setMessages(updatedMessages);
      }
      console.log(messages);

      return Promise.resolve();
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast.error('Failed to generate flashcards');

      // Update messages by removing the loading message
      updatedMessages = updatedMessages.filter(msg => msg.id !== loadingMessageId);
      setMessages(updatedMessages);

      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  }, [id, messages, setIsLoading, setMessages]);

  //SEGUN COME HERE AND ADD FILES ARG HERE LATER 
  const handleSend = async (text: string) => {
    if (!text.trim()) return
    if (id) {
      try {
        // Trim messages to the last 10 messages to limit context length
        const recentMessages = messages.slice(-10);
        const resp = await useWorkspaceStore.getState().askQuestion(
          id.toString(),
          text,
          true,
          'workspace',
          recentMessages,
          undefined
        )
        console.log(resp);

      } catch (error) {
        console.error('Error sending message:', error)
        toast('Error: Failed to send message')
      }
    }
  }

  return (
    <div className="flex  h-full w-full overflow-hidden">
      <div className={`flex flex-col h-full w-full justify-between pb-10 ${isQuizPanelOpen ? '' : 'min-w-full'}`}>
        <div className='absolute top-10 right-10 '>
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
        {
          loadChats ? (
            <div className='flex items-center justify-center min-h-screen'>
              <Loader2 className='w-8 h-8 animate-spin' />
            </div>
          ) : (
            <div>
              {messages.length === 0 ? (
                <div className='mt-16'>
                  <WelcomeScreen onSend={handleSend} />
                </div>
              ) : (
                <ChatMessageList messages={messages} isLoading={isLoading} />
              )}
            </div>
          )
        }
        <ChatInputForm
          onSend={handleSend}
          onGenerateFlashcards={handleGenerateFlashcards}
          disabled={isLoading}
        />
      </div>
      <SlidingPanel
        isOpen={isQuizPanelOpen}
        onClose={handleCloseQuizPanel}
        workspaceId={id.toString()}
      />
    </div>
  )
}
"use client"

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import ChatInputForm from '@/components/home/chat-input-form'
import { WelcomeScreen } from '@/components/chat/welcome-screen'
import { ChatMessageList } from '@/components/chat/message-list'
import { useChatStore } from '@/store/chat.store'
import { toast } from 'sonner'
import workspaceServiceInstance from "@/services/workspace.service"
import chatServiceInstance from "@/services/chat.service"
import { useWorkspaceStore } from '@/store/workspace.store'
import { UploadMaterialModal } from '@/components/home/upload-material-modal'
import Image from 'next/image'

export default function WorkspacePage() {
  const { setCurrentChatId, setChatDetails } = useChatStore()
  const { messages, setMessages, isLoading, askQuestion } = useWorkspaceStore()

  const { id } = useParams()
  const router = useRouter()

  useEffect(() => {
    setCurrentChatId(id as string | null)
  }, [id, setCurrentChatId])
  console.log(messages);

  useEffect(() => {
    if (id) {
      const getWorkspaceChat = async () => {
        try {
          // Get workspace details and chat info
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

  const handleSend = async (text: string, files?: File) => {
    if (!text.trim()) return
    if (id) {
      try {
        await useWorkspaceStore.getState().askQuestion(
          id.toString(),
          text,
          true,
          'workspace',
          messages,
          undefined
        )
      } catch (error) {
        console.error('Error sending message:', error)
        toast('Error: Failed to send message')
      }
    }
  }

  return (
    <div className="flex flex-col w-full justify-between pb-10 mx-auto h-full">
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
      {messages.length === 0 ? (
        <div className='mt-16'>
          <WelcomeScreen onSend={handleSend} />
        </div>
      ) : (
        <ChatMessageList messages={messages} isLoading={isLoading} />
      )}
      <ChatInputForm onSend={handleSend} disabled={isLoading} />
    </div>
  )
}
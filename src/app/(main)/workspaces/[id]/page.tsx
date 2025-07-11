"use client"

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import ChatInputForm from '@/components/home/chat-input-form'
import { WelcomeScreen } from '@/components/chat/welcome-screen'
import { ChatMessageList } from '@/components/chat/message-list'
import { useChatStore } from '@/store/chat.store'
import { toast } from 'sonner'
import workspaceServiceInstance from "@/services/workspace.service"

export default function WorkspacePage() {
  const { messages, setMessages, isLoading, sendMessage, setCurrentChatId, setChatDetails } = useChatStore()
  const { id } = useParams()
  const router = useRouter()

  useEffect(() => {
    setCurrentChatId(id as string | null)
  }, [id, setCurrentChatId])

  useEffect(() => {
    if (id) {
      const getWorkspaceChat = async () => {
        try {
          const workspace = await workspaceServiceInstance.getWorkspaces(id.toString())
          setChatDetails({
            title: workspace.name,
            description: workspace.description || ""
          })
          
          // Get messages for this workspace
          const retrievedMessages = await workspaceServiceInstance.getWorkspaceMessages(id.toString())
          setMessages(retrievedMessages)
        } catch (error) {
          toast('Error: Cant find workspace chat')
          console.error(error)
          router.push('/workspaces')
        }
      }

      getWorkspaceChat()
    }
  }, [id, sendMessage])

  const handleSend = async (text: string, files?: File) => {
    if (!text.trim()) return
    if (id) {
      await sendMessage(id.toString(), text, messages, false, files)
    }
  }

  return (
    <div className="flex flex-col w-full justify-between pb-10 mx-auto h-full">
      {!id && messages.length === 0 ? (
        <WelcomeScreen onSend={handleSend} />
      ) : (
        <ChatMessageList messages={messages} isLoading={isLoading} />
      )}
      <ChatInputForm onSend={handleSend} disabled={isLoading} />
    </div>
  )
}
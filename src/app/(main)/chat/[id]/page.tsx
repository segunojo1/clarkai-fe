'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import ChatInputForm from '@/components/home/chat-input-form'
import { WelcomeScreen } from '@/components/chat/welcome-screen'
import { ChatMessageList } from '@/components/chat/message-list'
import { useChatStore } from '@/store/chat.store'
import Image from 'next/image'

export default function ChatPage() {
  const { messages, isLoading, sendMessage, setCurrentChatId } = useChatStore()
  const { chatId } = useParams()
  const router = useRouter()

  // Set chat ID when component mounts
  useEffect(() => {
    setCurrentChatId(chatId as string | null)
  }, [chatId, setCurrentChatId])

  // Load initial messages when chat ID changes
  useEffect(() => {
    if (chatId) {
      // Simulate loading initial messages
      setTimeout(() => {
        sendMessage('Welcome back! How can I assist you today?')
      }, 500)
    }
  }, [chatId, sendMessage])

  const handleSend = async (message: string) => {
    if (!message.trim()) return

    await sendMessage(message)
  }

  return (
    <div className="flex flex-col w-full max-w-[750px] mx-auto h-full">
      <div className="flex-1 overflow-y-auto">
        {!chatId && messages.length === 0 ? (
          <WelcomeScreen onSend={handleSend} />
        ) : (
          <ChatMessageList messages={messages} isLoading={isLoading} />
        )}
      </div>
      <ChatInputForm onSend={handleSend} disabled={isLoading} />
    </div>
  )
}
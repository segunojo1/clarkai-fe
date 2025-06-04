'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import ChatInputForm from '@/components/home/chat-input-form'
import { WelcomeScreen } from '@/components/chat/welcome-screen'
import { ChatMessageList } from '@/components/chat/message-list'
import { useChatStore } from '@/store/chat.store'
import Image from 'next/image'
// import ChatInputForm from '@/components/home/ChatInputForm'

export default function ChatPage() {
  const { messages, isLoading, sendMessage, setCurrentChatId } = useChatStore()
  const { id } = useParams()
  
  const {getMessages} = useChatStore()
  const router = useRouter()

  // Set chat ID when component mounts
  useEffect(() => {
    console.log(id);

    setCurrentChatId(id as string | null)
  }, [id, setCurrentChatId])

  // Load initial messages when chat ID changes
  useEffect(() => {
    if (id) {
      // Simulate loading initial messages
      // getMessages(1, chatId)
      setTimeout(() => {
        sendMessage('Welcome back! How can I assist you today?')
      }, 500)
    }
  }, [id, sendMessage])

  const handleSend = async (message: string, file?: File) => {
    if (!message.trim()) return

    await sendMessage(message, file)
  }

  return (
    <div className="flex flex-col w-full justify-between max-w-[750px] pb-10 mx-auto h-full">
        {!id && messages.length === 0 ? (
          <WelcomeScreen onSend={handleSend} />
        ) : (
          <ChatMessageList messages={messages} isLoading={isLoading} />
        )}
      <ChatInputForm onSend={handleSend} disabled={isLoading} />
    </div>
  )
}
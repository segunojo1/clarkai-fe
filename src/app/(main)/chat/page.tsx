'use client'

import { ChatMessageList } from '@/components/chat/message-list'
import { WelcomeScreen } from '@/components/chat/welcome-screen'
import ChatInputForm from '@/components/home/chat-input-form'
import { HelpCircle } from 'lucide-react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useChatStore } from '@/store/chat.store'
import { useEffect } from 'react'

const Chat = () => {
  const { messages, isLoading, sendMessage, setCurrentChatId } = useChatStore()
  const { chatId } = useParams()
  const router = useRouter()

  // Set chat ID when component mounts
  useEffect(() => {
    setCurrentChatId(chatId as string | null)
  }, [chatId, setCurrentChatId])

  const handleSend = async (message: string) => {
    if (!message.trim()) return
    router.push(`/chat/60000`)
    await sendMessage(message)
  }

  return (
    <div className='w-full flex flex-col items-center bg-[#FAFAFA] dark:bg-[#262626] max-h-screen h-full'>
      <Image 
        src='/assets/logo.svg' 
        alt='ClarkAI Logo' 
        width={103} 
        height={90} 
        className='mx-auto mb-14' 
        priority
      />
      <div className='flex flex-col h-full max-w-[750px] pb-10'>
        {messages.length > 0 ? (
          <ChatMessageList messages={messages} isLoading={isLoading} />
        ) : (
          <WelcomeScreen onSend={handleSend} />
        )}
        <ChatInputForm onSend={handleSend} disabled={isLoading} />
      </div>
      <HelpCircle className='absolute bottom-5 right-5 text-gray-400 hover:text-gray-600 cursor-pointer' />
    </div>
  )
}

export default Chat
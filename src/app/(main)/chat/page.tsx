'use client'

import { ChatMessageList } from '@/components/chat/message-list'
import { WelcomeScreen } from '@/components/chat/welcome-screen'
import ChatInputForm from '@/components/home/chat-input-form'
import { HelpCircle } from 'lucide-react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useChatStore } from '@/store/chat.store'
import { useEffect } from 'react'
import chatService from '@/services/chat.service'

const Chat = () => {
  const { messages, isLoading, sendMessage, setCurrentChatId, setIsLoading } = useChatStore()
  const { chatId } = useParams()
  const router = useRouter()

  // Set chat ID when component mounts
  useEffect(() => {
    setCurrentChatId(chatId as string | null)
  }, [chatId, setCurrentChatId])

  const handleSend = async (message: string) => {
    setIsLoading(true)
    if (!message.trim()) return
    const {id} = await chatService.createChat();
    console.log(id);
    router.push(`/chat/${id}`)
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
      <div className='flex flex-col justify-between h-full max-w-[750px] pb-10'>

        <WelcomeScreen onSend={handleSend} />
        <ChatInputForm onSend={handleSend} disabled={isLoading} />
      </div>
      <HelpCircle className='absolute bottom-5 right-5 text-gray-400 hover:text-gray-600 cursor-pointer' />
    </div>
  )
}

export default Chat
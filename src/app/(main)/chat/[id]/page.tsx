'use client'

import { useParams, useRouter } from 'next/navigation'

import ChatInputForm from '@/components/home/chat-input-form'
import { WelcomeScreen } from '@/components/chat/welcome-screen'
import { ChatMessageList } from '@/components/chat/message-list'
import { useChatStore } from '@/store/chat.store'
import { toast } from 'sonner'
import { useEffect } from 'react'
// import ChatInputForm from '@/components/home/ChatInputForm'

export default function ChatPage() {
  const { messages, setMessages, isLoading, sendMessage, setCurrentChatId, setChatDetails } = useChatStore()
  const { id } = useParams()

  const { getMessages } = useChatStore()
  const router = useRouter()
  useEffect(() => {
    console.log(id);

    setCurrentChatId(id as string | null)
  }, [id, setCurrentChatId])

  useEffect(() => {
    if (id) {
      // setIsLoading(true)
      const getAllMessages = async () => {
        try {
          
          const retrievedMessages = await getMessages(1, id.toString())
          console.log(retrievedMessages);
          setChatDetails(retrievedMessages)
          setMessages(retrievedMessages.messages)
        } catch (error) {
          toast('Error: Cant find chat')
          console.error(error);
          router.push('/chat')
        }
      }

      getAllMessages()

      // setIsLoading(false);
    }
  }, [id, sendMessage])

  useEffect(() => {
    console.log(messages);

  }, [messages])

  const handleSend = async (text: string, files?: File[]) => {
    if (!text.trim()) return
    if (id) {

      await sendMessage(id.toString(), text, messages, false, files)
    }
  }

  return (
    <div className="flex flex-col w-full justify-between  pb-10 mx-auto h-full">
      {!id && messages.length === 0 ? (
        <WelcomeScreen onSend={handleSend} />
      ) : (
        <ChatMessageList messages={messages} isLoading={isLoading} />
      )}
      <ChatInputForm onSend={handleSend} disabled={isLoading} />
    </div>
  )
}
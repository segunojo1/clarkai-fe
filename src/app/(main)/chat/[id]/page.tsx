'use client'

import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import ChatInputForm from '@/components/home/chat-input-form'
import { WelcomeScreen } from '@/components/chat/welcome-screen'
import { ChatMessageList } from '@/components/chat/message-list'
import { useChatStore } from '@/store/chat.store'
// import ChatInputForm from '@/components/home/ChatInputForm'

export default function ChatPage() {
  const { messages, setMessages, isLoading, sendMessage, setCurrentChatId } = useChatStore()
  const { id } = useParams()
  
  const {getMessages} = useChatStore()
  // const router = useRouter()

  // Set chat ID when component mounts
  useEffect(() => {
    console.log(id);

    setCurrentChatId(id as string | null)
  }, [id, setCurrentChatId])

  // Load initial messages when chat ID changes
  useEffect(() => {
    if (id) {
      // setIsLoading(true)
      const getAllMessages = async () => {
        const retrievedMessages = await getMessages(1, id.toString())
        console.log(retrievedMessages);
        setMessages(retrievedMessages)
      }
      
      getAllMessages()

      // setIsLoading(false);
    }
  }, [id, sendMessage])

  useEffect(() => {
    console.log(messages);
    
  }, [messages])

  const handleSend = async (text: string, files?: File) => {
    if (!text.trim()) return
if(id) {

  await sendMessage(id.toString(), text, messages, false, files)
}
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
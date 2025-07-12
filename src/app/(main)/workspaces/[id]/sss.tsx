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



//workspacaes.tsx
<div className="flex flex-1">
                {/* Left Sidebar - Workspace List */}
                <div className="w-64 p-6">
                    <div className="space-y-4">
                        {workspaces.map((workspace) => (
                            <Link href={`/workspaces/${workspace.enc_id}`} className="w-64 p-6" key={workspace.enc_id}>
                                <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#444] relative">
                                    {/* Star icon in top right */}
                                    <Star className="absolute top-4 right-4 w-4 h-4 text-gray-400 hover:text-yellow-400 cursor-pointer transition-colors" />

                                    {/* File icon using file.png */}
                                    <div className="flex justify-center mb-8 mt-4">
                                        <Image
                                            src="/assets/file.png"
                                            alt="File icon"
                                            width={160}
                                            height={120}
                                            className="w-40 h-32"
                                        />
                                    </div>

                                    <div>
                                        <h3 className="text-gray-300 font-medium text-lg">{workspace.name}</h3>
                                        {workspace.description && (
                                            <p className="text-gray-400 text-sm mt-1">{workspace.description}</p>
                                        )}
                                    </div>
                                </div>
                            </Link>

                        ))}
                    </div>
                </div>

            </div>
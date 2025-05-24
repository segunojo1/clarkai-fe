import { create } from 'zustand'
import { ChatMessage } from '@/lib/types'

interface ChatStore {
  messages: ChatMessage[]
  isLoading: boolean
  currentChatId: string | null
  addMessage: (message: ChatMessage) => void
  clearMessages: () => void
  setIsLoading: (isLoading: boolean) => void
  setCurrentChatId: (chatId: string | null) => void
  sendMessage: (message: string) => Promise<void>
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isLoading: false,
  currentChatId: null,

  addMessage: (message: ChatMessage) => {
    set((state) => ({
      messages: [...state.messages, message]
    }))
  },

  clearMessages: () => {
    set({ messages: [] })
  },

  setIsLoading: (isLoading: boolean) => {
    set({ isLoading })
  },

  setCurrentChatId: (chatId: string | null) => {
    set({ currentChatId: chatId })
  },

  sendMessage: async (message: string, file?: File) => {
    if (!message.trim() && !file) return

    const { messages, currentChatId, addMessage, setIsLoading } = get()

    // Add user message with optional file attachment
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      attachments: file ? [file] : []
    }
    addMessage(userMessage)

    try {
      setIsLoading(true)

      // Simulate API call with file upload if present
      if (file) {
        // In a real implementation, you would upload the file here
        // const formData = new FormData();
        // formData.append('file', file);
        // formData.append('message', message);
        // await api.post('/chat/message', formData);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Add assistant message
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: file 
          ? `I've received your file: ${file.name}. How can I help you with it?` 
          : 'This is a simulated response. Please implement the API integration.'
      }
      addMessage(assistantMessage)
    } catch (error) {
      console.error('Error sending message:', error)
      // Add error message
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, there was an error processing your message.'
      }
      addMessage(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }
}))
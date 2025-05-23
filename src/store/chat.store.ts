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

  sendMessage: async (message: string) => {
    if (!message.trim()) return

    const { messages, currentChatId, addMessage, setIsLoading } = get()

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: message
    }
    addMessage(userMessage)

    try {
      setIsLoading(true)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Add assistant message
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: 'This is a simulated response. Please implement the API integration.'
      }
      addMessage(assistantMessage)
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }
}))
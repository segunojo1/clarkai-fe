import { create } from 'zustand'
import { ChatBox, ChatMessage, ChatResponse } from '@/lib/types'
import chatService from '@/services/chat.service'

interface ChatStore {
  messages: ChatMessage[]
  chatDetails: ChatResponse | null
  isLoading: boolean
  currentChatId: string | null
  chats: ChatBox[]
  addMessage: (message: ChatMessage) => void
  clearMessages: () => void
  setIsLoading: (isLoading: boolean) => void
  setCurrentChatId: (chatId: string | null) => void
  sendMessage: (chat_id: string, text: string, previous_messages: ChatMessage[], strict_mode: boolean, files?: File) => Promise<void>
  getMessages: (page: number, chat_id: string) => Promise<ChatResponse>
  setMessages: (messages: ChatMessage[]) => void
  setChatDetails: (chatDetails: ChatResponse) => void
  getAllChats: (page: number) => Promise<ChatBox[]>
  setChats: (chats: ChatBox[]) => void
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isLoading: false,
  currentChatId: null,
  chatDetails: null,
  chats: [],
  setChatDetails: (chatDetails: ChatResponse) => {
    set({ chatDetails })
  },
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

  setMessages: (messages: ChatMessage[]) => {
    set({ messages })
  },

  setChats: (chats: ChatBox[]) => {
    set({ chats })
  },

  setCurrentChatId: (chatId: string | null) => {
    set({ currentChatId: chatId })
  },

  sendMessage: async (chat_id: string, text: string, previous_messages: ChatMessage[], strict_mode: boolean, files?: File) => {
    if (!text.trim() && !files) return

    const { addMessage, setIsLoading } = get()

    // Add user message with optional file attachment
    const userMessage: ChatMessage = {
      role: 'user',
      text: text,
      isFile: files ? true : false,
      fromUser: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      attachments: files ? [files] : []
    }
    addMessage(userMessage)

    try {
      setIsLoading(true)
      const formData = new FormData();

      formData.append('chat_id', chat_id);
      formData.append('text', text);
      formData.append('previous_messages', JSON.stringify(previous_messages));
      formData.append('strict_mode', strict_mode.toString())
      if (files) {
        formData.append('files', files);
      }

      const aiResponse = await chatService.sendChatMessage(formData)

      // Add assistant message
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        text: aiResponse.answer,
        isFile: files ? true : false,
        fromUser: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      addMessage(assistantMessage)
    } catch (error) {
      console.error('Error sending message:', error)
      // Add error message
      const errorMessage: ChatMessage = {
        role: 'assistant',
        isFile: false,
        fromUser: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        text: 'Sorry, there was an error processing your message.'
      }
      addMessage(errorMessage)
    } finally {
      setIsLoading(false)
    }
  },

  getMessages: async (page = 1, chat_id) => {
    try {
      const messages = await chatService.getChat(page, chat_id)
      console.log(messages);
      return messages
    } catch (error) {

      console.error(error);
      throw error
    }

  },

  getAllChats: async (page = 1) => {
    try {
      const messages = await chatService.getChat(page)
      console.log(messages);
      set({ chats: messages.chats })
      return messages.chats
    } catch (error) {
      console.error(error);
      throw error
    }
  }
}))
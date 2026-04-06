import { create } from "zustand";
import {
  ChatBox,
  ChatMessage,
  ChatResponse,
  ChatSendResponse,
} from "@/lib/types";
import chatService from "@/services/chat.service";
import { toast } from "sonner";

interface ChatStore {
  messages: ChatMessage[];
  chatDetails: ChatResponse | null;
  isLoading: boolean;
  currentChatId: string | null;
  chats: ChatBox[];
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  setIsLoading: (isLoading: boolean) => void;
  setCurrentChatId: (chatId: string | null) => void;
  sendMessage: (
    text: string,
    previous_messages: ChatMessage[],
    strict_mode: boolean,
    files?: File[],
    chat_id?: string,
  ) => Promise<ChatSendResponse | undefined>;
  getMessages: (page: number, chat_id: string) => Promise<ChatResponse>;
  setMessages: (messages: ChatMessage[]) => void;
  setChatDetails: (chatDetails: ChatResponse) => void;
  getAllChats: (page: number) => Promise<ChatBox[]>;
  setChats: (chats: ChatBox[]) => void;
  removeChat: (chatId: string) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isLoading: false,
  currentChatId: null,
  chatDetails: null,
  chats: [],
  setChatDetails: (chatDetails: ChatResponse) => {
    set({ chatDetails });
  },
  addMessage: (message: ChatMessage) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  setIsLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setMessages: (messages: ChatMessage[]) => {
    set({ messages });
  },

  setChats: (chats: ChatBox[]) => {
    set({ chats });
  },

  removeChat: (chatId: string) => {
    set((state) => ({
      chats: state.chats.filter((chat) => chat.id !== chatId),
    }));
  },

  setCurrentChatId: (chatId: string | null) => {
    set({ currentChatId: chatId });
  },

  sendMessage: async (
    text: string,
    previous_messages: ChatMessage[],
    strict_mode: boolean,
    files?: File[],
    chat_id?: string,
  ): Promise<ChatSendResponse | undefined> => {
    if (!text.trim() && !files) return;

    const { addMessage, setIsLoading } = get();

    const userMessage: ChatMessage = {
      role: "user",
      text: text,
      isFile: files ? true : false,
      fromUser: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      attachments: files,
      isFlashcard: false,
      flashcardId: null,
      size: null,
    };
    addMessage(userMessage);
    try {
      setIsLoading(true);
      const formData = new FormData();
      if (chat_id) {
        formData.append("chat_id", chat_id);
      }
      formData.append("text", text);
      formData.append("previous_messages", JSON.stringify(previous_messages));
      formData.append("strict_mode", strict_mode.toString());
      if (files) {
        files.forEach((file) => {
          formData.append("files", file);
        });
      }

      const aiResponse: ChatSendResponse =
        await chatService.sendChatMessage(formData);

      // Add assistant message
      const assistantMessage: ChatMessage = {
        role: "assistant",
        text: aiResponse.answer,
        isFile: false,
        fromUser: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        isFlashcard: false,
        flashcardId: null,
        size: null,
      };
      addMessage(assistantMessage);
      return aiResponse;
    } catch (error) {
      console.error("Error sending message:", error);
      // Add error message
      const errorMessage: ChatMessage = {
        role: "assistant",
        isFile: false,
        fromUser: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        text: "Sorry, there was an error processing your message.",
        isFlashcard: false,
        flashcardId: null,
        size: null,
      };
      addMessage(errorMessage);
      return undefined;
    } finally {
      text.includes("@")
        ? toast("Tags work well only in workspace chat!")
        : null;
      setIsLoading(false);
    }
  },

  getMessages: async (page = 1, chat_id: string) => {
    try {
      const messages = await chatService.getChat(page, chat_id);
      console.log(messages);
      return messages;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getAllChats: async (page = 1) => {
    try {
      const messages = await chatService.getChat(page);
      set({ chats: messages.chats });
      return messages.chats;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
}));

import axios, { AxiosInstance } from "axios";
import Cookies from "js-cookie";

class ChatService {
  private api: AxiosInstance;
  private static instance: ChatService;

  private constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = Cookies.get("token"); 
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  public async sendMessage(chatId: string, message: string) {
    try {
      const response = await this.api.post(`/chats/${chatId}/messages`, { message });
      return response.data;
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error; 
    }
  }

  public async createChat() {
    try {
        const response = await this.api.post(`/chats`)
        return response.data.chat;
    } catch (error) {
        console.error("failed to create chat", error);
        
    }

  }

  public async sendChatMessage(formData: FormData) {
    try {
        const response = await this.api.post(`/aichat`, formData, {
          headers: {
            "Content-Type": "multipart/formdata"
          }
        })
        return response.data
    } catch (error) {
        console.error("err sending chat");
        throw error;
    }
  }

  public async getChat(page: number, chat_id: string) {
    try {
        const response = await this.api.get(`/aichat`, {
            params: {page, chat_id}
        })
        return response.data
    } catch (error) {
        console.log(error);
        throw error;
    }
  }


}

export default ChatService.getInstance();
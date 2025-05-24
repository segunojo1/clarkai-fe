export interface FileAttachment {
  name: string;
  type: string;
  url?: string;
  size?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
  attachments?: FileAttachment[]
}
  
  export interface Chat {
    id: string
    title: string
    messages: ChatMessage[]
    createdAt: Date
    updatedAt: Date
  }
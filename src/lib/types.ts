export interface FileAttachment {
  name: string;
  type: string;
  url?: string;
  size?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
  isFile: boolean
  fromUser: boolean
  createdAt?: Date
  attachments?: FileAttachment[];
  updatedAt?: Date
}
  
  export interface Chat {
    id: string
    title: string
    messages: ChatMessage[]
    createdAt: Date
    updatedAt: Date
  }
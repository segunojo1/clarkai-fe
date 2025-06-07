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

export interface FileAttachment {
  name: string;
  size?: number;
  type: string;
  url?: string;
}

export interface ChatInfo {
  id: string;
  workspaceId: string | null;
  name: string;
}

export interface ChatResponse {
  page: string; 
  messages: ChatMessage[];
  chat: ChatInfo;
}
  
  export interface Chat {
    id: string
    title: string
    messages: ChatMessage[]
    createdAt: Date
    updatedAt: Date
  }

  export interface ChatBox {
    createdAt: string
    id: string
    name: string
    updatedAt: string
    workspaceId: null | string
  }
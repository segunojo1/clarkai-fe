export interface ChatMessage {
    role: 'user' | 'assistant'
    content: string
    timestamp?: Date
  }
  
  export interface Chat {
    id: string
    title: string
    messages: ChatMessage[]
    createdAt: Date
    updatedAt: Date
  }
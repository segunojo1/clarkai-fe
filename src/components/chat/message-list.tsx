'use client'

import { ChatMessage } from "@/lib/types"

export function ChatMessageList({ 
  messages, 
  isLoading 
}: { 
  messages: ChatMessage[], 
  isLoading: boolean 
}) {
  return (
    <div className="flex flex-col space-y-4 p-4 overflow-y-auto h-[calc(100vh-200px)]">
      {messages.length > 0 && (
        <div className="h-[140px]"></div>
      )}
      {messages.map((message, index) => (
        <div 
          key={index} 
          className={`flex ${
            message.role === 'user' 
              ? 'justify-end' 
              : 'justify-start'
          }`}
        >
          <div 
            className={`max-w-[80%] rounded-lg p-3 ${
              message.role === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-700'
            }`}
          >
            {message.content}
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-w-[80%]">
            <div className="flex gap-2">
              <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
              <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse delay-100"></div>
              <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse delay-200"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
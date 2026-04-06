"use client";

import { WelcomeScreen } from "@/components/chat/welcome-screen";
import ChatInputForm from "@/components/home/chat-input-form";
import { HelpCircle } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useChatStore } from "@/store/chat.store";
import { useEffect } from "react";

const Chat = () => {
  const { isLoading, chats, setChats, setCurrentChatId, sendMessage } =
    useChatStore();
  const { chatId } = useParams();
  const router = useRouter();

  // Set chat ID when component mounts
  useEffect(() => {
    setCurrentChatId(chatId as string | null);
  }, [chatId, setCurrentChatId]);

  const handleSend = async (message: string) => {
    if (!message.trim()) return;
    const response = await sendMessage(message, [], false);

    if (!response?.chat_id) return;

    setCurrentChatId(response.chat_id);

    if (response.chat_title) {
      const nextChat = {
        id: response.chat_id,
        name: response.chat_title,
        workspaceId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setChats([
        nextChat,
        ...chats.filter((chat) => chat.id !== response.chat_id),
      ]);
    }

    router.push(`/chat/${response.chat_id}`);
  };

  return (
    <div className="w-full flex flex-col items-center bg-[#FAFAFA] dark:bg-[#262626] max-h-screen h-full">
      <Image
        src="/assets/logo.svg"
        alt="ClarkAI Logo"
        width={103}
        height={90}
        className="mx-auto mb-14"
        priority
      />
      <div className="flex flex-col justify-between h-full max-w-[750px] pb-10">
        <WelcomeScreen onSend={handleSend} />
        <ChatInputForm onSend={handleSend} disabled={isLoading} />
      </div>
      <HelpCircle className="absolute bottom-5 right-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
    </div>
  );
};

export default Chat;

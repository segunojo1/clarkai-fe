"use client";

import { useParams, useRouter } from "next/navigation";

import ChatInputForm from "@/components/home/chat-input-form";
import { WelcomeScreen } from "@/components/chat/welcome-screen";
import { ChatMessageList } from "@/components/chat/message-list";
import { useChatStore } from "@/store/chat.store";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import workspaceService from "@/services/workspace.service";
import { Edit } from "lucide-react";
// import ChatInputForm from '@/components/home/ChatInputForm'

export default function ChatPage() {
  const {
    chats,
    messages,
    setMessages,
    isLoading,
    sendMessage,
    chatDetails,
    setCurrentChatId,
    setChatDetails,
    setChats,
  } = useChatStore();
  const { id } = useParams();
  const [currentChat, setCurrentChat] = useState();

  const getChatById = (id: string) => {
    const chat = chats?.find((c) => c.id === id);
    console.log(chat);
    return chat;
  };

  const [isRenamingChat, setIsRenamingChat] = useState(false);
  const [chatNameInput, setChatNameInput] = useState("");

  const { getMessages } = useChatStore();
  const router = useRouter();
  useEffect(() => {
    console.log(id);

    setCurrentChatId(id as string | null);
  }, [id, setCurrentChatId]);

  useEffect(() => {
    if (id) {
      // setIsLoading(true)
      const getAllMessages = async () => {
        try {
          const retrievedMessages = await getMessages(1, id.toString());
          console.log(retrievedMessages);
          setChatDetails(retrievedMessages);
          setMessages(retrievedMessages.messages);
        } catch (error) {
          toast("Error: Cant find chat");
          console.error(error);
          router.push("/chat");
        }
      };

      getAllMessages();

      // setIsLoading(false);
    }
  }, [id, sendMessage]);

  const handleRenameChat = async () => {
    if (!chatNameInput.trim() || !id) {
      toast.error("Chat name cannot be empty");
      return;
    }

    try {
      const resp = await workspaceService.renameChat(
        id.toString(),
        chatNameInput.trim(),
      );
      if (resp?.success) {
        if (chats && setChats) {
          const updated = chats.map((c: any) =>
            c.id === id ? { ...c, name: chatNameInput.trim() } : c,
          );
          setChats(updated);
        }

        toast.success("Chat renamed successfully!");
        setIsRenamingChat(false);
        setChatNameInput("");
      } else {
        toast.error(resp?.message || "Failed to rename chat");
      }
    } catch (error) {
      console.error("Error renaming chat:", error);
      toast.error("Failed to rename chat");
    }
  };

  useEffect(() => {
    console.log(messages);
  }, [messages]);

  const handleSend = async (text: string, files?: File[]) => {
    if (!text.trim()) return;
    if (id) {
      toast("Sending message...");
      setMessages(messages.filter((m) => m.id !== 'suggested-questions-prompt'));
      await sendMessage(id.toString(), text, messages, false, files);
    }
  };

  return (
    <div className="flex flex-col w-full justify-between  pb-10 mx-auto h-full">
      <div className="flex gap-2 items-center p-4 pl-11">
        {isRenamingChat ? (
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={chatNameInput}
              onChange={(e) => setChatNameInput(e.target.value)}
              placeholder={getChatById(id)?.name || "Chat name"}
              className="text-2xl font-bold bg-gray-700 text-white px-3 py-2 rounded border border-gray-500 focus:outline-none focus:border-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameChat();
                if (e.key === "Escape") setIsRenamingChat(false);
              }}
            />

            <button
              onClick={handleRenameChat}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
            >
              Save
            </button>
            <button
              onClick={() => setIsRenamingChat(false)}
              className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex gap-2 items-center">
            <h1 className="text-2xl font-bold text-white">
              {getChatById(id)?.name}
            </h1>
            <button
              onClick={() => {
                setIsRenamingChat(true);
                setChatNameInput(getChatById(id)?.name || "");
              }}
              className="text-gray-400 hover:text-gray-200 transition-colors"
              title="Click to rename workspace"
            >
              <Edit />
            </button>
          </div>
        )}
      </div>
      {!id && messages.length === 0 ? (
        <WelcomeScreen onSend={handleSend} />
      ) : (
        <ChatMessageList messages={messages} isLoading={isLoading} />
      )}
      <ChatInputForm onSend={handleSend} disabled={isLoading} />
    </div>
  );
}

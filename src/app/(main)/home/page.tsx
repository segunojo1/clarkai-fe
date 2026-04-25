"use client";
import { Suspense } from "react";

import Calendar from "@/components/home/Calendar";
import ChatInputForm from "@/components/home/chat-input-form";
import OnboardingModal from "@/components/home/onboarding-modal";
import Streaks from "@/components/home/streaks";
import Workspaces from "@/components/home/workspaces";
import { Clock } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { hasCompletedOnboarding, setOnboardingCompleted } from "@/lib/cookies";
import { useUserStore } from "@/store/user.store";
import { useChatStore } from "@/store/chat.store";
import { useWorkspaceStore } from "@/store/workspace.store";
import { getTimeBasedGreeting } from "@/lib/utils";

const HomePageContent = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWorkspaceGuide, setShowWorkspaceGuide] = useState(false);
  const searchParams = useSearchParams();
  const skipOnboarding = searchParams.get("skipOnboarding") === "true";
  const { isLoading, sendMessage, setCurrentChatId, setChats, chats } =
    useChatStore();
  const { workspaces, isLoading: isWorkspaceLoading } = useWorkspaceStore();
  const router = useRouter();

  useEffect(() => {
    // Only check for first visit if not explicitly skipping
    if (!skipOnboarding && !hasCompletedOnboarding()) {
      setShowOnboarding(true);
    }
  }, [skipOnboarding]);

  useEffect(() => {
    if (showOnboarding || isWorkspaceLoading) return;
    if (typeof window === "undefined") return;

    const hasSeenGuide =
      window.localStorage.getItem("home-workspace-guide-seen") === "true";

    if (!hasSeenGuide && workspaces.length === 0) {
      setShowWorkspaceGuide(true);
    }
  }, [showOnboarding, isWorkspaceLoading, workspaces.length]);

  const dismissWorkspaceGuide = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("home-workspace-guide-seen", "true");
    }
    setShowWorkspaceGuide(false);
  };

  const openWorkspaces = () => {
    dismissWorkspaceGuide();
    router.push("/workspaces");
  };

  const { theme } = useTheme();
  const { user } = useUserStore();

  const handleSend = async (text: string, files?: File[]) => {
    if (!text.trim()) return;
    const response = await sendMessage(text, [], false, files);

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
    <div className="w-full flex flex-col h-full overflow-scroll items-center bg-[#FAFAFA] dark:bg-[#262626]">
      <Image
        src="/assets/logo.svg"
        alt=""
        width={103}
        height={90}
        className="mx-auto mb-[55px]"
      />
      <div className="flex items-center gap-5 mb-[51px]">
        {theme === "dark" ? (
          <Image
            src="/assets/user-dark.svg"
            alt=""
            width={45}
            height={45}
            className=""
          />
        ) : (
          <Image
            src="/assets/user.svg"
            alt=""
            width={45}
            height={45}
            className=""
          />
        )}
        <h1 className="text-[30px]/[120%] font-bold satoshi">
          {getTimeBasedGreeting()}, {user?.name?.split(" ")[0]}
        </h1>
      </div>
      <div className="flex flex-col items-start ">
        <ChatInputForm onSend={handleSend} disabled={isLoading} />
        <div className="relative">
          <Workspaces />

          {showWorkspaceGuide && (
            <>
              <div className="pointer-events-none absolute -inset-2 rounded-2xl border-2 border-[#FF3D00]/60 animate-pulse" />
              <div className="absolute right-0 -top-2 z-20 w-[280px] rounded-xl border border-[#FFD1C2] bg-white p-4 shadow-xl dark:border-[#5A2A1A] dark:bg-[#1F1F1F]">
                <p className="text-sm font-semibold text-[#FF3D00]">
                  Create your first workspace
                </p>
                <p className="mt-1 text-xs text-[#737373] dark:text-[#B0B0B0]">
                  Start by creating a workspace so you can upload materials and
                  organize your study flow.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openWorkspaces}
                    className="rounded-md bg-[#FF3D00] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#E63600]"
                  >
                    Open Workspaces
                  </button>
                  <button
                    type="button"
                    onClick={dismissWorkspaceGuide}
                    className="rounded-md px-3 py-1.5 text-xs font-medium text-[#737373] hover:bg-[#F5F5F5] dark:text-[#D4D4D4] dark:hover:bg-[#2C2C2C]"
                  >
                    Later
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center justify-between w-full mt-[50px] mb-[39px]">
          <div className="text-[#A3A3A3] flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4" />
            <p className="text-sm font-medium">Streaks</p>
          </div>

          <div className="text-[#A3A3A3] flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4" />
            <p className="text-sm font-medium">Events</p>
          </div>
        </div>
        <div className="flex bg-white dark:bg-[#2C2C2C] p-4 rounded-md items-start justify-between w-full">
          <Streaks />
          <div className="w-[1px] h-[226px] bg-[#F0F0EF] dark:bg-[#404040] mx-[24px]"></div>
          <Calendar />
        </div>
      </div>

      {showOnboarding && (
        <OnboardingModal
          onClose={() => {
            setShowOnboarding(false);
            setOnboardingCompleted();
          }}
        />
      )}
    </div>
  );
};

const HomePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageContent />
    </Suspense>
  );
};

export default HomePage;

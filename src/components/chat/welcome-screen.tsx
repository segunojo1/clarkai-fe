"use client";

import { useUserStore } from "@/store/user.store";
import { useWorkspaceStore } from "@/store/workspace.store";
import UserAvatar from "../user-avatar";
import { SuggestedQuestion } from "./suggested-question";
import { getTimeBasedGreeting } from "@/lib/utils";
import { useEffect } from "react";

export function WelcomeScreen({
  onSend,
  workspaceId,
}: {
  onSend: (message: string) => void;
  workspaceId?: string;
}) {
  const { user } = useUserStore();
  const { suggestedQuestions, fetchSuggestedQuestions } = useWorkspaceStore();

  useEffect(() => {
    if (workspaceId) {
      fetchSuggestedQuestions(workspaceId);
    }
  }, [workspaceId, fetchSuggestedQuestions]);

  // Fallback suggested questions if API doesn't return any
  const displayQuestions =
    suggestedQuestions.length > 0
      ? suggestedQuestions.map((text) => ({ text, type: "default" }))
      : [
          {
            text: "Explain Quantum Mechanics like I'm five.",
            type: "physics",
          },
          {
            text: "Graph the derivative of f(x) = 3x² + 2x.",
            type: "math",
          },
          {
            text: "Test me with a quiz on Human Anatomy!",
            type: "anatomy",
          },
        ];

  return (
    <div className="flex flex-col items-center flex-grow">
      <div className="flex items-center gap-5 mb-[71px]">
        <UserAvatar />
        <h1 className="text-[30px]/[120%] font-bold satoshi dark:text-[#D4D4D4] text-[#191919]">
          {getTimeBasedGreeting()}, {user?.name?.split(" ")[0]}
        </h1>
      </div>

      <div className="flex items-center gap-5">
        {displayQuestions.map((question, index) => (
          <SuggestedQuestion
            key={index}
            type={question.type}
            text={question.text}
            onClick={() => onSend(question.text)}
          />
        ))}
      </div>
    </div>
  );
}

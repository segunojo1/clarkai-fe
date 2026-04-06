"use client";

import React, { useMemo, useState } from "react";
import { ChevronUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTaskStore } from "@/store/task.store";

export function TaskFloatingWidget() {
  const { tasks } = useTaskStore();
  const [isOpen, setIsOpen] = useState(false);

  const sortedFutureTasks = useMemo(() => {
    const now = Date.now();
    return tasks
      .filter((task) => new Date(task.deadline).getTime() >= now)
      .sort(
        (a, b) =>
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
      );
  }, [tasks]);

  const closestTask = useMemo(
    () => sortedFutureTasks[0],
    [sortedFutureTasks],
  );

  const dueSoonCount = useMemo(() => {
    const now = Date.now();
    const in48h = now + 48 * 60 * 60 * 1000;
    return tasks.filter((task) => {
      const deadline = new Date(task.deadline).getTime();
      return deadline >= now && deadline <= in48h;
    }).length;
  }, [tasks]);

  if (!closestTask) {
    return null;
  }

  const deadlineDate = new Date(closestTask.deadline);
  const now = new Date();
  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let timeText = "";
  if (diffDays > 0) {
    timeText = `${diffDays}d away`;
  } else if (diffHours > 0) {
    timeText = `${diffHours}h away`;
  } else {
    timeText = "Due soon";
  }

  const isUrgent = dueSoonCount > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div className="fixed bottom-6 left-6 z-40">
        <DialogTrigger asChild>
          <Button
            className={`h-auto max-w-xs rounded-lg px-3 py-2 text-left shadow-lg transition-all ${
              isUrgent
                ? "border border-[#ff3d00]/40 bg-[#ff3d00]/15 text-[#ff3d00] hover:bg-[#ff3d00]/25"
                : "border border-[#2c2c2c] bg-[#1a1d21] text-[#d0d0d0] hover:bg-[#23262b]"
            }`}
          >
            <div className="flex w-full items-start gap-2">
              <Clock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">
                  {closestTask.title}
                </p>
                <p className="text-[11px] opacity-80">
                  {timeText}
                </p>
              </div>
              <ChevronUp className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
            </div>
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent className="max-h-[80vh] overflow-y-auto border-[#232323] bg-[#0f1012] text-[#f5f5f5]">
        <DialogHeader>
          <DialogTitle>Upcoming tasks</DialogTitle>
          <DialogDescription className="text-[#9e9e9e]">
            Your study tasks and deadlines.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {sortedFutureTasks.length === 0 ? (
            <p className="text-sm text-[#9e9e9e]">No upcoming tasks.</p>
          ) : (
            <>
              {sortedFutureTasks.map((task, idx) => {
                const taskDeadline = new Date(task.deadline);
                const now = new Date();
                const taskDiffMs = taskDeadline.getTime() - now.getTime();
                const taskDiffHours = Math.floor(taskDiffMs / (1000 * 60 * 60));
                const taskDiffDays = Math.floor(
                  taskDiffMs / (1000 * 60 * 60 * 24),
                );

                let taskTimeText = "";
                if (taskDiffDays > 0) {
                  taskTimeText = `${taskDiffDays}d away`;
                } else if (taskDiffHours > 0) {
                  taskTimeText = `${taskDiffHours}h away`;
                } else {
                  taskTimeText = "Due soon";
                }

                const isFirst = idx === 0;
                const isSoon =
                  taskDiffMs > 0 && taskDiffMs <= 48 * 60 * 60 * 1000;

                return (
                  <div
                    key={task.id}
                    className={`rounded-md px-3 py-2 text-sm ${
                      isFirst
                        ? "border border-[#ff3d00]/30 bg-[#ff3d00]/10"
                        : isSoon
                          ? "border border-[#ff3d00]/20 bg-[#ff3d00]/5"
                          : "border border-[#31343a] bg-[#1a1d21]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{task.title}</p>
                        <p className="text-[12px] opacity-70">
                          {taskDeadline.toLocaleString()}
                        </p>
                      </div>
                      <p className="flex-shrink-0 text-[11px] opacity-60">
                        {taskTimeText}
                      </p>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

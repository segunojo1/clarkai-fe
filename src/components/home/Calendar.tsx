"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CalendarIcon, Loader2, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUserStore } from "@/store/user.store";
import { useTaskStore, type StudyTask } from "@/store/task.store";

declare global {
  interface Window {
    google: any;
  }
}

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID;

const loadGoogleScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google script"));
    document.body.appendChild(script);
  });
};

const STORAGE_TASKS_KEY = "clark-calendar-study-tasks";

const Calendar = () => {
  const { googleCalendarConnected, setGoogleCalendarConnected } =
    useUserStore();
  const { tasks, setTasks, addTask } = useTaskStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDate, setTaskDate] = useState<Date | undefined>(undefined);
  const [taskTime, setTaskTime] = useState("09:00");

  const sortedFutureTasks = useMemo(() => {
    const now = Date.now();
    return tasks
      .filter((task) => new Date(task.deadline).getTime() >= now)
      .sort(
        (a, b) =>
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
      );
  }, [tasks]);

  const dueSoonTasks = useMemo(() => {
    const now = Date.now();
    const in48h = now + 48 * 60 * 60 * 1000;
    return sortedFutureTasks.filter((task) => {
      const deadline = new Date(task.deadline).getTime();
      return deadline >= now && deadline <= in48h;
    });
  }, [sortedFutureTasks]);

  const upcomingTasks = useMemo(
    () => sortedFutureTasks.filter((task) => !dueSoonTasks.includes(task)),
    [dueSoonTasks, sortedFutureTasks],
  );

  const pastTasks = useMemo(() => {
    const now = Date.now();
    return tasks
      .filter((task) => new Date(task.deadline).getTime() < now)
      .sort(
        (a, b) =>
          new Date(b.deadline).getTime() - new Date(a.deadline).getTime(),
      );
  }, [tasks]);

  const getAccessToken = async () => {
    if (!GOOGLE_CLIENT_ID) {
      toast.error(
        "Missing Google Client ID. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID and restart the dev server.",
      );
      throw new Error("Missing Google Client ID");
    }

    await loadGoogleScript("https://accounts.google.com/gsi/client");

    return await new Promise<string>((resolve, reject) => {
      const googleRef = window.google;
      if (!googleRef?.accounts?.oauth2) {
        reject(new Error("Google OAuth client unavailable"));
        return;
      }

      const client = googleRef.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "https://www.googleapis.com/auth/calendar.events",
        callback: (response: { access_token?: string; error?: string }) => {
          if (response?.error) {
            reject(new Error(response.error));
            return;
          }
          if (!response?.access_token) {
            reject(new Error("No access token received"));
            return;
          }
          resolve(response.access_token);
        },
      });

      client.requestAccessToken();
    });
  };

  const handleConnectGoogleCalendar = async () => {
    try {
      setIsConnecting(true);
      await getAccessToken();
      setGoogleCalendarConnected(true);
      toast.success("Google Calendar connected.");
      await handleSyncGoogleCalendar();
    } catch (error) {
      console.error("Failed to connect Google Calendar:", error);
      toast.error("Failed to connect Google Calendar");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSyncGoogleCalendar = async () => {
    try {
      setIsSyncingCalendar(true);
      const token = await getAccessToken();

      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events?orderBy=startTime&singleEvents=true&timeMin=" +
          new Date().toISOString(),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error?.message || "Failed to sync calendar");
      }

      const calendarEvents = (result.items || []).map((event: any) => ({
        id: event.id,
        title: event.summary,
        deadline: event.start?.dateTime || event.start?.date,
        eventLink: event.htmlLink,
        description: event.description,
      }));

      const existingIds = new Set(tasks.map((t) => t.id));
      const newEvents = calendarEvents.filter(
        (e: StudyTask) => !existingIds.has(e.id),
      );

      newEvents.forEach((event: StudyTask) => {
        addTask(event);
      });

      if (newEvents.length > 0) {
        toast.success(`Synced ${newEvents.length} event(s) from Google Calendar`);
      }
    } catch (error) {
      console.error("Failed to sync Google Calendar:", error);
      toast.error("Could not sync calendar events");
    } finally {
      setIsSyncingCalendar(false);
    }
  };

  const handleCreateTask = async () => {
    if (!taskTitle.trim() || !taskDate) {
      toast.error("Please add a task title and date.");
      return;
    }

    if (!googleCalendarConnected) {
      toast.error("Connect Google Calendar first.");
      return;
    }

    try {
      setIsSavingTask(true);
      const token = await getAccessToken();

      const [hours, minutes] = taskTime.split(":").map(Number);
      const startAt = new Date(taskDate);
      startAt.setHours(hours || 9, minutes || 0, 0, 0);
      const endAt = new Date(startAt.getTime() + 60 * 60 * 1000);

      const eventPayload = {
        summary: taskTitle,
        description:
          taskDescription ||
          "Created from Clark calendar planner for study organization.",
        start: {
          dateTime: startAt.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: endAt.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };

      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventPayload),
        },
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error?.message || "Failed to create event");
      }

      const newTask: StudyTask = {
        id: result.id || `${Date.now()}`,
        title: taskTitle,
        deadline: startAt.toISOString(),
        eventLink: result.htmlLink,
        description: taskDescription,
      };
      addTask(newTask);

      setTaskTitle("");
      setTaskDescription("");
      setTaskDate(undefined);
      setTaskTime("09:00");
      toast.success("Task synced to Google Calendar.");
    } catch (error) {
      console.error("Failed to create calendar task:", error);
      toast.error("Could not sync task to Google Calendar");
    } finally {
      setIsSavingTask(false);
    }
  };

  return (
    <Card className="w-[342px] min-h-[245px] border-0 bg-[#F0F0EF] p-0 shadow-none dark:bg-[#404040]">
      <CardHeader className="px-[15px] pt-[14px] pb-0">
        <CardTitle className="text-[18px] font-bold leading-snug text-[#737373] satoshi dark:text-[#FAFAFA]">
          Keep track of your studies and stay organized with{" "}
          <span>Clarlender.</span>
        </CardTitle>
        <CardDescription className="text-[14px] text-[#525252] dark:text-[#D4D4D4]">
          Connect Google Calendar and sync your tasks, deadlines, and study
          blocks.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 px-[15px] pb-[15px] pt-0">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleConnectGoogleCalendar}
            disabled={googleCalendarConnected || isConnecting}
            className="flex-1 h-auto justify-start p-0 text-[14px] font-medium text-[#FF3D00] hover:bg-transparent hover:text-[#e53600] dark:text-[#FE8228]"
          >
            {googleCalendarConnected
              ? "Google Calendar Connected"
              : isConnecting
                ? "Connecting..."
                : "Connect Google Calendar"}
          </Button>
          {googleCalendarConnected && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleSyncGoogleCalendar}
              disabled={isSyncingCalendar}
              className="h-auto px-2 py-0 text-xs text-[#9f9f9f] hover:text-[#f5f5f5]"
            >
              {isSyncingCalendar ? "Syncing..." : "Sync"}
            </Button>
          )}
        </div>

        {(tasks.length > 0 || dueSoonTasks.length > 0) && (
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-white/60 px-3 py-2 text-[11px] dark:bg-[#2f2f2f]">
            <p className="text-[#6a6a6a] dark:text-[#cccccc]">
              {dueSoonTasks.length > 0
                ? `${dueSoonTasks.length} due soon • ${tasks.length} total tasks`
                : `${tasks.length} total tasks`}
            </p>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-7 px-2 text-[11px] text-[#FF3D00] hover:text-[#e53600]"
                >
                  View tasks
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto border-[#232323] bg-[#0f1012] text-[#f5f5f5]">
                <DialogHeader>
                  <DialogTitle>Upcoming tasks & nudges</DialogTitle>
                  <DialogDescription className="text-[#9e9e9e]">
                    All tasks created from this planner are listed here.
                  </DialogDescription>
                </DialogHeader>

                {dueSoonTasks.length > 0 && (
                  <div className="rounded-xl border border-[#ff3d00]/25 bg-[#ff3d00]/10 px-3 py-2 text-xs text-[#ffd3b0]">
                    <p className="font-semibold">
                      Deadline nudge: {dueSoonTasks.length} task
                      {dueSoonTasks.length > 1 ? "s are" : " is"} due in the
                      next 48 hours.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#fead72]">
                      Due soon
                    </p>
                    {dueSoonTasks.length === 0 ? (
                      <p className="text-xs text-[#9e9e9e]">
                        No urgent deadlines.
                      </p>
                    ) : (
                      dueSoonTasks.map((task) => (
                        <div
                          key={task.id}
                          className="rounded-md border border-[#ff3d00]/25 bg-[#ff3d00]/8 px-2 py-1.5 text-[12px]"
                        >
                          <p className="font-semibold">{task.title}</p>
                          <p className="text-[#cfcfcf]">
                            {new Date(task.deadline).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#d8d8d8]">
                      Upcoming
                    </p>
                    {upcomingTasks.length === 0 ? (
                      <p className="text-xs text-[#9e9e9e]">
                        No upcoming tasks.
                      </p>
                    ) : (
                      upcomingTasks.map((task) => (
                        <div
                          key={task.id}
                          className="rounded-md border border-[#31343a] bg-[#1a1d21] px-2 py-1.5 text-[12px]"
                        >
                          <p className="font-semibold">{task.title}</p>
                          <p className="text-[#bdbdbd]">
                            {new Date(task.deadline).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#9f9f9f]">
                      Past tasks
                    </p>
                    {pastTasks.length === 0 ? (
                      <p className="text-xs text-[#9e9e9e]">
                        No past tasks yet.
                      </p>
                    ) : (
                      pastTasks.map((task) => (
                        <div
                          key={task.id}
                          className="rounded-md border border-[#2b2d31] bg-[#15171a] px-2 py-1.5 text-[12px]"
                        >
                          <p className="font-semibold text-[#d0d0d0]">
                            {task.title}
                          </p>
                          <p className="text-[#9f9f9f]">
                            {new Date(task.deadline).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        <div className="space-y-2 rounded-xl border border-border/60 bg-white/65 p-3 shadow-sm dark:bg-[#2f2f2f]">
          <Input
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="Task title (e.g. Revise Integration)"
            className="h-9 text-xs"
          />
          <Textarea
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            placeholder="Optional notes"
            rows={2}
            className="min-h-16 text-xs"
          />
          <div className="grid grid-cols-2 gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 w-full justify-start gap-2 text-xs"
                >
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {taskDate ? taskDate.toLocaleDateString() : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarPicker
                  mode="single"
                  selected={taskDate}
                  onSelect={setTaskDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Input
              type="time"
              value={taskTime}
              onChange={(e) => setTaskTime(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <Button
            type="button"
            onClick={handleCreateTask}
            disabled={!googleCalendarConnected || isSavingTask}
            className="h-9 w-full gap-2 bg-[#FF3D00] text-xs text-white hover:bg-[#e53600] disabled:opacity-60"
          >
            {isSavingTask ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <PlusCircle className="h-3.5 w-3.5" />
                Add task to Google Calendar
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Calendar;

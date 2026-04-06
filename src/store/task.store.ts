import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type StudyTask = {
  id: string;
  title: string;
  deadline: string;
  eventLink?: string;
  description?: string;
};

type TaskStore = {
  tasks: StudyTask[];
  setTasks: (tasks: StudyTask[]) => void;
  addTask: (task: StudyTask) => void;
  removeTask: (taskId: string) => void;
  clearTasks: () => void;
};

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [],
      setTasks: (tasks) => set({ tasks }),
      addTask: (task) =>
        set((state) => ({
          tasks: [task, ...state.tasks],
        })),
      removeTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== taskId),
        })),
      clearTasks: () => set({ tasks: [] }),
    }),
    {
      name: "task-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

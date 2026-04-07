import { create } from "zustand";
import workspaceService from "@/services/workspace.service";
import { ChatMessage, FlashcardData } from "@/lib/types";

interface Workspace {
  workspace: {
    name: string;
    description?: string;
    enc_id: string;
    files: {
      imageFiles: Array<{
        id: string;
        filePath: string;
        fileName: string;
        size: string;
      }>;
      pdfFiles: Array<{
        id: string;
        filePath: string;
        fileName: string;
        size: string;
      }>;
      youtubeVideos: Array<{
        videoId: string;
        title: string;
        description?: string;
        channelTitle?: string;
        thumbnailUrl?: string;
        viewCount?: number;
        likeCount?: number;
        commentCount?: number;
        duration?: string;
        workspaceId?: string;
      }>;
    };
    quizzes: Array<{
      id: string;
      name: string;
      creator: string;
      userId: number;
      workspaceId: string;
      fileId: string;
      quizSource: string;
      quizSourceType: string;
      duration: number;
      createdAt: string;
      updatedAt: string;
    }>;
    chat: {
      id: string;
      userId: number;
      workspaceId: string;
      name: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}

type Workspaces = Array<{
  name: string;
  enc_id: string;
  description: string;
  tag: string;
}>;

interface WorkspaceStore {
  workspaces: Workspaces;
  selectedWorkspace: Workspace | null;
  workspaceId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  askSource: string;
  isQuizPanelOpen: boolean;
  suggestedQuestions: string[];
  setSuggestedQuestions: (questions: string[]) => void;
  fetchSuggestedQuestions: (workspaceId: string) => Promise<void>;
  renameWorkspace: (workspaceId: string, newName: string) => Promise<void>;
  setIsQuizPanelOpen: (open: boolean) => void;
  setAskSource: (source: "ai" | "materials") => void;
  getWorkspaces: () => Promise<void>;
  createWorkspace: (name: string, description?: string) => Promise<void>;
  selectWorkspace: (workspace: Workspace) => void;
  clearError: () => void;
  setError: (error: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  askQuestion: (
    workspaceId: string,
    question: string,
    thinking: boolean,
    mode: "workspace" | "file" | "internet",
    previous_messages: ChatMessage[],
    fileId?: string,
  ) => Promise<void>;
  uploadFile: (files: File[], workspaceId: string) => Promise<void>;
  generateFlashcards: (
    mode: "workspace" | "file",
    workspaceId: string,
    size: number,
    is_context: boolean,
    context: string,
    file_id?: string,
  ) => Promise<void>;
  fetchFlashcard: (id: string) => Promise<FlashcardData[] | null>;
  selectedFlashcards: FlashcardData[];
  setSelectedFlashcards: (flashcards: FlashcardData[]) => void;
  isFlashcardModalOpen: boolean;
  setIsFlashcardModalOpen: (open: boolean) => void;
  selectedFlashcardId: string | null;
  setSelectedFlashcardId: (id: string | null) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  workspaces: [],
  selectedWorkspace: null,
  workspaceId: null,
  messages: [],
  isLoading: false,
  error: null,
  selectedFlashcards: [],
  isFlashcardModalOpen: false,
  selectedFlashcardId: null,
  askSource: "ai",
  isQuizPanelOpen: false,
  suggestedQuestions: [],
  setSuggestedQuestions: (questions: string[]) => {
    set({ suggestedQuestions: questions });
  },
  setIsQuizPanelOpen: (open: boolean) => {
    set({ isQuizPanelOpen: open });
  },
  setAskSource: (source: "ai" | "materials") => {
    set({ askSource: source });
  },
  setIsFlashcardModalOpen: (open: boolean) => {
    set({ isFlashcardModalOpen: open });
  },
  setSelectedFlashcards: (flashcards: FlashcardData[]) => {
    set({ selectedFlashcards: flashcards });
  },
  setSelectedFlashcardId: (id: string | null) => {
    set({ selectedFlashcardId: id });
  },
  setError: (error: string) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  selectWorkspace: (workspace: Workspace) => {
    //SEGUN CHECK I CHANGED workspace.enc_id TO workspace.workspace.enc_id
    set({
      selectedWorkspace: workspace,
      workspaceId: workspace.workspace.enc_id,
    });
  },

  addMessage: (message: ChatMessage) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },
  setMessages: (messages: ChatMessage[]) => {
    set({ messages });
  },
  setIsLoading: (isLoading: boolean) => {
    set({ isLoading });
  },
  getWorkspaces: async () => {
    set({ isLoading: true, error: null });
    try {
      const workspaces = await workspaceService.getWorkspaces();
      set({ workspaces });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch workspaces",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createWorkspace: async (name: string, tag?: string, description?: string) => {
    set({ isLoading: true, error: null });
    try {
      await workspaceService.createWorkspace(name, tag, description);
      // Refresh workspaces after creation
      await get().getWorkspaces();
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to create workspace",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  askQuestion: async (
    workspaceId: string,
    question: string,
    thinking: boolean,
    mode: "workspace" | "file" | "internet",
    previous_messages: ChatMessage[],
    fileId?: string,
  ) => {
    if (!question.trim()) return;
    const { setIsLoading } = get();

    // Add user message
    const userMessage: ChatMessage = {
      role: "user",
      text: question,
      isFile: false,

      fromUser: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      isFlashcard: false,
      flashcardId: null,
      size: null,
    };
    get().addMessage(userMessage);
    console.log(get().messages);

    try {
      setIsLoading(true);
      const response = await workspaceService.askQuestion(
        question,
        workspaceId,
        thinking,
        mode,
        previous_messages,
        fileId,
      );

      // Add assistant message
      const assistantMessage: ChatMessage = {
        role: "assistant",
        text: response.answer,
        isFile: false,
        fromUser: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        isFlashcard: false,
        flashcardId: null,
        size: null,
        follow_up_suggestions: response.follow_up_suggestions || [],
      };
      get().addMessage(assistantMessage);
    } catch (error) {
      console.error("Error asking question:", error);
      // Add error message
      const errorMessage: ChatMessage = {
        role: "assistant",
        text: "Sorry, there was an error processing your message.",
        isFile: false,
        fromUser: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        isFlashcard: false,
        flashcardId: null,
        size: null,
      };
      get().addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  },

  generateFlashcards: async (
    mode: "workspace" | "file",
    workspaceId: string,
    size: number,
    is_context: boolean,
    context: string,
    file_id?: string,
  ) => {
    if (!workspaceId) return;

    try {
      const dataa = await workspaceService.generateFlashcards(
        mode,
        workspaceId,
        size,
        is_context,
        context,
        file_id,
      );
      // Refresh workspaces to update the list
      console.log(dataa);
      return dataa;
      // await get().getWorkspaces()
    } catch (error) {
      console.error("Error generating flashcards:", error);
      set({ error: "Failed to generate flashcards" });
    }
  },

  uploadFile: async (files: File[], workspaceId: string) => {
    if (!files.length || !workspaceId) return;

    try {
      await workspaceService.uploadFile(files, workspaceId);
      // Refresh workspaces to update the list
      await get().getWorkspaces();
    } catch (error) {
      console.error("Error uploading file:", error);
      set({ error: "Failed to upload file" });
    }
  },

  fetchFlashcard: async (id: string): Promise<FlashcardData[] | null> => {
    try {
      const response = await workspaceService.fetchFlashcards(id);
      return response || null;
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      set({ error: "Failed to fetch flashcards" });
      return null;
    }
  },

  fetchSuggestedQuestions: async (workspaceId: string) => {
    try {
      const response =
        await workspaceService.suggestWorkspaceQuestion(workspaceId);
      const questions = Array.isArray(response)
        ? response
        : response?.follow_up_suggestions ||
          response?.suggested_questions ||
          [];
      set({ suggestedQuestions: questions });
    } catch (error) {
      console.error("Error fetching suggested questions:", error);
      set({ error: "Failed to fetch suggested questions" });
    }
  },

  renameWorkspace: async (workspaceId: string, newName: string) => {
    try {
      await workspaceService.renameWorkspace(workspaceId, newName);
      // Update the selected workspace with the new name
      const currentWorkspace = get().selectedWorkspace;
      if (currentWorkspace) {
        set({
          selectedWorkspace: {
            ...currentWorkspace,
            workspace: {
              ...currentWorkspace.workspace,
              name: newName,
            },
          },
        });
      }
      // Refresh workspaces to keep the list in sync
      await get().getWorkspaces();
    } catch (error) {
      console.error("Error renaming workspace:", error);
      set({ error: "Failed to rename workspace" });
      throw error;
    }
  },

  search: async () => {},
}));

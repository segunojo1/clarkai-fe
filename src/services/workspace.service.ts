import { ChatMessage } from "@/lib/types";
import axios, { AxiosInstance } from "axios";
import Cookies from "js-cookie";

class WorkspaceService {
  private static instance: WorkspaceService;
  private api: AxiosInstance;

  private constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });
    this.api.interceptors.request.use(
      (config) => {
        const token = Cookies.get("token");
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );
  }

  public static getInstance(): WorkspaceService {
    if (!WorkspaceService.instance) {
      WorkspaceService.instance = new WorkspaceService();
    }
    return WorkspaceService.instance;
  }

  public async createWorkspace(
    name: string,
    tag?: string,
    description?: string,
  ) {
    try {
      const response = await this.api.post(`/workspace`, {
        name,
        tag,
        description,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to create workspace");
      }

      return {
        id: response.data.workspace_id,
        name: response.data.name,
        chat: response.data.chat,
      };
    } catch (error) {
      console.error("Failed to create workspace:", error);
      throw error;
    }
  }
  public async getWorkspaces(workspaceId?: string) {
    try {
      const endpoint = workspaceId ? `/workspace/${workspaceId}` : `/workspace`;
      const response = await this.api.get(endpoint);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to get workspaces");
      }

      return workspaceId ? response.data : response.data.workspaces;
    } catch (error) {
      console.error("Failed to get workspaces:", error);
      throw error;
    }
  }

  public async askQuestion(
    question: string,
    workspaceId: string,
    thinking: boolean,
    mode: "workspace" | "file" | "internet",
    previous_messages: ChatMessage[],
    fileId?: string,
  ) {
    try {
      const response = await this.api.post("/askQuestion", {
        question,
        workspace_id: workspaceId,
        thinking,
        mode,
        file_id: fileId,
        previous_messages,
      });

      return {
        answer: response.data.answer,
        follow_up_suggestions: response.data.follow_up_suggestions || [],
      };
    } catch (error) {
      console.error("Failed to ask question:", error);
      throw error;
    }
  }

  public async generateFlashcards(
    mode: "workspace" | "file",
    workspaceId: string,
    size: number,
    is_context: boolean,
    context: string,
    file_id?: string,
  ) {
    try {
      const response = await this.api.post("/generateFlashcards", {
        mode,
        workspace_id: workspaceId,
        size,
        is_context,
        context,
        file_id,
      });
      console.log(response.data);

      return response.data;
    } catch (error) {
      console.error("Failed to generate flashcards:", error);
      throw error;
    }
  }

  public async uploadFile(files: File[], workspaceId: string) {
    try {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("workspace_id", workspaceId);

      const response = await this.api.post("/files", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to upload file");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to upload file:", error);
      throw error;
    }
  }

  public async deleteFile(workspaceId: string, fileUrl: string) {
    try {
      const response = await this.api.delete("/files", {
        data: {
          workspace_id: workspaceId,
          file_url: fileUrl,
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete file");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to delete file:", error);
      throw error;
    }
  }

  public async fetchWorkspaceFlashcards(workspaceId: string) {
    try {
      const response = await this.api.get("/workspaceFlashCard", {
        params: { workspace_id: workspaceId },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch flashcards");
      }

      return response.data.flashcards || [];
    } catch (error) {
      console.error("Failed to fetch workspace flashcards:", error);
      throw error;
    }
  }

  public async fetchFlashcards(id: string) {
    try {
      const response = await this.api.get(`/flashcard/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch flashcards:", error);
      throw error;
    }
  }

  public async generateMaterial(
    topic: string,
    words_range: string,
    is_tag: boolean,
    user_message: string,
    files?: string[],
  ) {
    try {
      const response = await this.api.post("/generateMaterial", {
        topic,
        words_range,
        files,
        is_tag,
        user_message,
      });
      console.log(response.data);

      return response.data;
    } catch (error) {
      console.error("Failed to generate material:", error);
      throw error;
    }
  }

  public async deleteWorkspace(id: string) {
    try {
      const response = await this.api.delete(`/workspace/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to delete workspace:", error);
      throw error;
    }
  }

  public async addYoutubeVideoToWorkspace({
    video_id,
    workspace_id,
  }: {
    video_id: string;
    workspace_id: string;
  }) {
    try {
      const response = await this.api.post("/youtube", {
        video_id,
        workspace_id,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to add YouTube video to workspace:", error);
      throw error;
    }
  }
//this tests if the youtube video exists and sends back a preview
  public async testYoutubeVideo(video_id: string) {
    try {
      const response = await this.api.get(`/youtube/${video_id}`, {});
      return response.data;
    } catch (error) {
      console.error("Failed to test YouTube video:", error);
      throw error;
    }
  }

  public async suggestWorkspaceQuestion(workspaceId: string) {
    try {
      const response = await this.api.post("/suggestQuestion", {
        workspace_id: workspaceId,
        mode: "workspace",
      });
      return response.data;
    } catch (error) {
      console.error("Failed to suggest workspace question:", error);
      throw error;
    }
  }

  public async renameChat(chatId: string, newName: string) {
    try {
      const response = await this.api.patch("/renameChat", { chatId, newName });
      return response.data;
    } catch (error) {
      console.error("Failed to rename chat:", error);
      throw error;
    }
  }

  public async renameWorkspace(workspaceId: string, newName: string) {
    try {
      const response = await this.api.patch("/renameWorkspace", {
        workspaceId,
        newName,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to rename workspace:", error);
      throw error;
    }
  }

  public async updateUserDetails({
    fullName,
    nickname,
    username,
    school,
    major
  }: {
    fullName?: string;
    nickname?: string;
    username?: string;
    school?: string;
    major?: string;
  }) {
    try {
      const response = await this.api.patch("/updateUserDetails", {
        fullName,
        nickname,
        username,
        school,
        major
      });
      return response.data;
    }catch(error){
      console.error("Failed to update user details:", error);
      throw error;
    }
  }

  public async search({
    s
  }: {
    s: string;
  }) {
    try {
      const response = await this.api.get("/search", {
        params: {
          s
        }
      });
      return response.data;
    } catch (error) {
      console.error("Failed to perform search:", error);
        throw error;
    }
  }

  public async deleteYtVideoFromWorkspace({
    workspace_id,
    video_id,
  }: {
    workspace_id: string;
    video_id: string;
  }) {
    try {
      const response = await this.api.delete("/youtube", {
        params: {
          workspace_id,
          video_id,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to delete YouTube video from workspace:", error);
      throw error;
    }
  }
}

export default WorkspaceService.getInstance();

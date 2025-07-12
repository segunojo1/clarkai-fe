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
                "Content-Type": "application/json"
            }
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
            (error) => Promise.reject(error)
          );
    }

    public static getInstance(): WorkspaceService {
        if (!WorkspaceService.instance) {
            WorkspaceService.instance = new WorkspaceService();
        }
        return WorkspaceService.instance;
    }

    public async createWorkspace(name: string, description?: string) {
        try {
            const response = await this.api.post(`/workspace`, {
                name,
                description
            });
            
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to create workspace');
            }
            
            return {
                id: response.data.workspace_id,
                name: response.data.name,
                chat: response.data.chat
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
                throw new Error(response.data.message || 'Failed to get workspaces');
            }
            
            return workspaceId ? response.data : response.data.workspaces;
        } catch (error) {
            console.error("Failed to get workspaces:", error);
            throw error;
        }
    }

    public async askQuestion(question: string, workspaceId: string, thinking: boolean, mode: 'workspace' | 'file', previous_messages: ChatMessage[], fileId?: string) {
        try {
            const response = await this.api.post('/askQuestion', {
                question,
                workspace_id: workspaceId,
                thinking,
                mode,
                file_id: fileId,
                previous_messages
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to ask question');
            }

            return {
                success: response.data.success,
                answer: response.data.answer
            };
        } catch (error) {
            console.error("Failed to ask question:", error);
            throw error;
        }
    }

    public async uploadFile(file: File, workspaceId: string) {
        try {
            const formData = new FormData();
            formData.append('files', file);
            formData.append('workspace_id', workspaceId);

            const response = await this.api.post('/files', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to upload file');
            }

            return response.data;
        } catch (error) {
            console.error("Failed to upload file:", error);
            throw error;
        }
    }
}

export default WorkspaceService.getInstance();

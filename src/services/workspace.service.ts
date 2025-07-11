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
    public async getWorkspaces() {
        try {
            const response = await this.api.get(`/workspace`);
            
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to get workspaces');
            }
            
            return response.data.workspaces;
        } catch (error) {
            console.error("Failed to get workspaces:", error);
            throw error;
        }
    }
}

export default WorkspaceService.getInstance();

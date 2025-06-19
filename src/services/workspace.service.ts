import axios, { AxiosInstance } from "axios";

class WorkspaceService {
    private api: AxiosInstance;
    private static instance: WorkspaceService;

    private constructor() {
        this.api = axios.create({
            baseURL: "https://github.com",
            headers: {
                "Content-Type": "application/json"
            }
        })
    }

    public async createWorkspace() {
        try {
            
        } catch (error) {
            
        }
    }
}
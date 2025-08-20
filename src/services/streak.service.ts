import axios, { AxiosInstance } from "axios";
import Cookies from "js-cookie";

class StreakService {
    private static instance: StreakService;
    private api: AxiosInstance;

    private constructor() {
        this.api = axios.create({
            baseURL: process.env.NEXT_PUBLIC_API_BASE_URL_TWO,
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

    public static getInstance(): StreakService {
        if (!StreakService.instance) {
            StreakService.instance = new StreakService();
        }
        return StreakService.instance;
    }

    public async getAndAddStreak() {
        try {
            const response = await this.api.post(`/api/user/streak/increment`);
            return response.data;
        } catch (error) {
            console.error("Failed to get and add streak:", error);
            throw error;
        }
    }
}

export default StreakService.getInstance()
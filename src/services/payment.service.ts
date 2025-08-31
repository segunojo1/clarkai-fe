import axios, { AxiosInstance } from "axios";
import Cookies from "js-cookie";

class PaymentService {
    private static instance: PaymentService;
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

    public static getInstance(): PaymentService {
        if (!PaymentService.instance) {
            PaymentService.instance = new PaymentService();
        }
        return PaymentService.instance;
    }

    public async initializePayment() {
        try {
            const response = await this.api.post(`/api/payment/initialize`);
            return response.data;
        } catch (error) {
            console.error("Failed to initialize payment:", error);
            throw error;
        }
    }

    public async verifyPayment(reference: string) {
        try {
            const response = await this.api.get(`/api/payment/verify/${reference}`);
            return response.data;
        } catch (error) {
            console.error("Failed to verify payment:", error);
            throw error;
        }
    }
    public async cancelPayment() {
        try {
            const response = await this.api.post(`/api/payment/cancel`);
            return response.data;
        } catch (error) {
            console.error("Failed to initialize payment:", error);
            throw error;
        }
    }
}

export default PaymentService.getInstance()
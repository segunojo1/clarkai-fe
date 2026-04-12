import axios, { AxiosInstance } from "axios";
import Cookies from "js-cookie";

export type PaymentPlanType = "pro" | "teams";

export type InitializePaymentResponse = {
    success: boolean;
    authorizationUrl?: string;
    reference?: string;
};

export type VerifyPaymentResponse = {
    success: boolean;
    message?: string;
    user?: {
        plan?: "free" | "premium" | "enterprise";
        [key: string]: unknown;
    };
    data?: {
        user?: {
            plan?: "free" | "premium" | "enterprise";
            [key: string]: unknown;
        };
        [key: string]: unknown;
    };
    [key: string]: unknown;
};

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

    public async initializePayment(planType: PaymentPlanType = "pro"): Promise<InitializePaymentResponse> {
        try {
            const response = await this.api.post<InitializePaymentResponse>(`/api/payment/initialize/${planType}`);
            return response.data;
        } catch (error) {
            console.error("Failed to initialize payment:", error);
            throw error;
        }
    }

    public async verifyPayment(reference: string): Promise<VerifyPaymentResponse> {
        try {
            const response = await this.api.get<VerifyPaymentResponse>(`/api/payment/verify/${reference}`);
            return response.data;
        } catch (error) {
            console.error("Failed to verify payment:", error);
            throw error;
        }
    }

    public async getPaymentPlans() {
        try {
            const response = await this.api.get(`/api/payment/plans`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch payment plans:", error);
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
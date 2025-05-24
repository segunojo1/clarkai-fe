import { useUserStore } from '@/store/user.store';
import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

interface RegisterPayload {
  fullName: string;
  email: string;
  nickName: string;
  password: string;
  confirmPassword: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  nickname: string;
  role?: string;
  school?: string;
  department?: string;
  interests?: string;
  study_vibe?: string[];
  image_url?: string;
  dateCreated: string | null;
  dateModified: string | null;
}

export interface SignupPayload {
  name: string;
  email: string;
  nickname: string;
  password: string;
  role: string;
  school: string;
  department: string;
  interests: string[];
  study_vibe: string[];
  user_image?: File | string;
}

export interface OtpResponse {
  message: string;
  success: boolean;
}

class AuthService {
  private api: AxiosInstance;
  private static instance: AuthService;
  private readonly COOKIE_OPTIONS = {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    expires: 7 // 7 days
  };

  private constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    // Always initialize user state when getting the instance
    AuthService.instance.initializeUserState();
    return AuthService.instance;
  }

  public getAuthToken(): string | null {
    return Cookies.get('token') || null;
  }

  private initializeUserState() {
    const token = this.getAuthToken();
    
    if (token) {
      // Set the token in the API headers
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Get user from cookies
      const userStr = Cookies.get('user');
      
      if (userStr) {
        try {
          const user: User = JSON.parse(userStr); 
          
          useUserStore.getState().setUser(user);
          
        } catch (error) {
          console.error('Error parsing user data from cookies:', error);
          // If user data is invalid, clear everything
          this.logout();
        }
      } else {
        console.error('No user data found in cookies');
        // Clear the persisted state from localStorage
        localStorage.removeItem('user-storage');
        this.logout();
      }
    }
  }

  public async sendOtp(email: string, name: string): Promise<OtpResponse> {
    try {
      const response = await this.api.post<OtpResponse>('/otp', { email, name });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send OTP';
      console.error('OTP send failed:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  public async verifyOtp(email: string, otp: string): Promise<OtpResponse> {
    try {
      const response = await this.api.post<OtpResponse>('/verifyOTP', { email, otp });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'OTP verification failed';
      console.error('OTP verification failed:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  public async register(data: SignupPayload): Promise<{ user: User; token: string }> {
    try {
      const formData = new FormData();
      
      // Append all fields to formData
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'user_image' && value instanceof File) {
          formData.append('user_image', value);
        } else if (Array.isArray(value)) {
          // Handle array fields (interests, study_vibe)
          value.forEach(item => formData.append(key, item));
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      const response = await this.api.post<{ user: User; token: string }>('/signup', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Set auth token and user data in cookies
      if (response.data.token) {
        Cookies.set('token', response.data.token, this.COOKIE_OPTIONS);
        Cookies.set('user', JSON.stringify(response.data.user), this.COOKIE_OPTIONS);
        this.api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
      toast(errorMessage);
      throw new Error(errorMessage);
    }
  }
  public async login(email: string, password: string): Promise<{ user: User; token: string}> {
    try {
      const response = await this.api.post<{ user: User; token: string }>('/login', { email, password });

      if (response.data.token) {
        Cookies.set('token', response.data.token, this.COOKIE_OPTIONS);
        Cookies.set('user', JSON.stringify(response.data.user), this.COOKIE_OPTIONS);
        this.api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      toast(errorMessage);
      throw new Error(errorMessage);
    }
  }

  public logout(): void {
    // Remove auth token and user data from cookies
    Cookies.remove('token');
    Cookies.remove('user');
    
    // Clear authorization header
    delete this.api.defaults.headers.common['Authorization'];
    
    // Update user store
    const userStore = useUserStore.getState();
    userStore.setUser(null);
  }
}

export default AuthService.getInstance();
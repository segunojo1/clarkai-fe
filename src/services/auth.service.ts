import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';
interface RegisterPayload {
  fullName: string;
  email: string;
  nickName: string;
  password: string;
  confirmPassword: string;
}


export interface User {
  id: string;
  fullName: string;
  email: string;
  nickName: string;
  dateCreated: string | null;
  dateModified: string | null;
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
        clearAllPersistedState()

        this.logout();
      }
    }
  }


  public async register(data: RegisterPayload): Promise<AuthResponse> {
    try {
      // The backend will handle the inviteToken if present in the data object
      const response = await this.api.post<AuthResponse>('api/v1/signup', { ...data });
      return response.data;
    } catch (error: Error | { response?: { data?: { message: string } }, message?: string } | unknown) {
      const errorMessage = 
        error instanceof Error && error.message ? error.message : 
        typeof error === 'object' && error !== null && 'response' in error && 
        (error as { response: { data?: { message: string } } }).response?.data?.message ? 
        (error as { response: { data: { message: string } } }).response.data.message : 
        'Registration failed';
      
      console.error('Registration failed:', errorMessage);
      throw new Error(errorMessage);
    }
  }
}

export default AuthService.getInstance();
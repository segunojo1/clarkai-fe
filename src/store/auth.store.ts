import { create } from 'zustand';
import { User, SignupPayload } from '@/services/auth.service';

export interface SignupState extends Omit<SignupPayload, 'password' | 'confirmPassword'> {
  password?: string;
  confirmPassword?: string;
  currentStep: number;
  emailVerified: boolean;
  otp?: string;
}

interface AuthStore {
  user: User | null;
  signupData: Partial<SignupState>;
  setUser: (user: User | null) => void;
  updateSignupData: (data: Partial<SignupState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetSignup: () => void;
}

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  signupData: {
    currentStep: 0,
    emailVerified: false,
    interests: [],
    study_vibe: []
  },
  setUser: (user) => set({ user }),
  updateSignupData: (data) => 
    set((state) => ({
      signupData: { ...state.signupData, ...data }
    })),
  nextStep: () => 
    set((state) => {
      const currentStep = state.signupData.currentStep || 0;
      return {
        signupData: { 
          ...state.signupData, 
          currentStep: Math.min(currentStep + 1, 5) 
        }
      };
    }),
  prevStep: () => 
    set((state) => {
      const currentStep = state.signupData.currentStep || 1;
      return {
        signupData: { 
          ...state.signupData, 
          currentStep: Math.max(currentStep - 1, 0) 
        }
      };
    }),
  resetSignup: () => 
    set({
      signupData: {
        currentStep: 0,
        emailVerified: false,
        interests: [],
        study_vibe: []
      }
    })
}));

export default useAuthStore;
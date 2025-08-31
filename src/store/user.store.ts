import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type SubscriptionPlan = 'free' | 'premium' | 'enterprise';

type User = {
  id: string;
  email: string;
  name?: string;
  image_url?: string;
  subscription?: {
    plan: SubscriptionPlan;
    status: 'active' | 'canceled' | 'expired' | 'inactive';
    expiresAt?: string;
  };
};

type UserStore = {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      clearUser: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'user-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) use localStorage for persistence
    }
  )
);

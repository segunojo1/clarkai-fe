import workspaceService from '@/services/workspace.service';
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
  googleDriveConnected: boolean;
  googleCalendarConnected: boolean;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  setGoogleDriveConnected: (connected: boolean) => void;
  setGoogleCalendarConnected: (connected: boolean) => void;
  updateUserDetails: (userDetails: { fullName?: string; nickname?: string; username?: string; school?: string; major?: string }) => Promise<void>;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      googleDriveConnected: false,
      googleCalendarConnected: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      clearUser: () =>
        set({
          user: null,
          isAuthenticated: false,
          googleDriveConnected: false,
          googleCalendarConnected: false,
        }),
      setGoogleDriveConnected: (connected) =>
        set({ googleDriveConnected: connected }),
      setGoogleCalendarConnected: (connected) =>
        set({ googleCalendarConnected: connected }),
      updateUserDetails: async (userDetails: { fullName?: string; nickname?: string; username?: string; school?: string; major?: string }) => {
          try {
            await workspaceService.updateUserDetails(userDetails);
          } catch (error) {
            console.error("Error updating user details:", error);
          }
        },
    }),
    {
      name: 'user-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) use localStorage for persistence
    }
  )
);

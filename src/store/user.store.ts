import workspaceService from "@/services/workspace.service";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type SubscriptionPlan = "free" | "premium" | "enterprise";

type User = {
  id: string;
  email: string;
  name?: string;
  nickname?: string;
  username?: string;
  school?: string;
  major?: string;
  department?: string;
  image_url?: string;
  image?: string;
  plan?: SubscriptionPlan;
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
  updateUserDetails: (userDetails: {
    fullName?: string;
    nickname?: string;
    username?: string;
    school?: string;
    major?: string;
  }) => Promise<void>;
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
      updateUserDetails: async (userDetails: {
        fullName?: string;
        nickname?: string;
        username?: string;
        school?: string;
        major?: string;
      }) => {
        try {
          const response =
            await workspaceService.updateUserDetails(userDetails);

          set((state) => {
            if (!state.user) return state;

            const responseUser =
              response?.user || response?.data?.user || response?.data;

            const mergedUser: User = {
              ...state.user,
              ...(responseUser && typeof responseUser === "object"
                ? responseUser
                : {}),
              name: userDetails.fullName ?? state.user.name,
              nickname: userDetails.nickname ?? state.user.nickname,
              username: userDetails.username ?? state.user.username,
              school: userDetails.school ?? state.user.school,
              major:
                userDetails.major ?? state.user.major ?? state.user.department,
            };

            return { user: mergedUser };
          });
        } catch (error) {
          console.error("Error updating user details:", error);
        }
      },
    }),
    {
      name: "user-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) use localStorage for persistence
    },
  ),
);

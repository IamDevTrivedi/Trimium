import config from "@/config/env";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
    _id: string;
    username: string;
    email: string;

    firstName: string;
    lastName: string;

    createdAt: string;
    updatedAt: string;
}

export interface UserStore {
    user: User | null;
    setUser: (user: User) => void;
    isLoginedIn: () => boolean;
    reset: () => void;
}

export const useUserStore = create<UserStore>()(
    persist(
        (set, get) => ({
            user: null,
            setUser: (user: User) => set({ user }),
            isLoginedIn: () => !!get().user,
            reset: () => set({ user: null }),
        }),
        {
            name: `user-storage-${config.PUBLIC_NODE_ENV}`,
        }
    )
);

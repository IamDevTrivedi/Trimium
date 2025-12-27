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
    isLoggedIn: boolean;
    setUser: (user: User | null) => void;
    reset: () => void;
}

export const useUserStore = create<UserStore>()(
    persist(
        (set) => ({
            user: null,
            isLoggedIn: false,

            setUser: (user: User | null) =>
                set({
                    user,
                    isLoggedIn: !!user,
                }),

            reset: () =>
                set({
                    user: null,
                    isLoggedIn: false,
                }),
        }),
        {
            name: `user-storage-${config.PUBLIC_NODE_ENV}`,
        }
    )
);

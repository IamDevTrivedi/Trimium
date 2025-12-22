import { create } from "zustand";

export interface LoginStore {
    email: string;
    setEmail: (email: string) => void;

    password: string;
    setPassword: (password: string) => void;
}

export const useLoginStore = create<LoginStore>((set) => ({
    email: "",
    setEmail: (email: string) => set({ email }),

    password: "",
    setPassword: (password: string) => set({ password }),
}));

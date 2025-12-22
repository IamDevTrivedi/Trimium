import { create } from "zustand";

export interface CreateAccountState {
    email: string;
    OTP: string;
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    confirmPassword: string;

    setEmail: (email: string) => void;
    setOTP: (OTP: string) => void;
    setFirstName: (firstName: string) => void;
    setLastName: (lastName: string) => void;
    setUsername: (username: string) => void;
    setPassword: (password: string) => void;
    setConfirmPassword: (confirmPassword: string) => void;

    reset: () => void;
}

export const useCreateAccountStore = create<CreateAccountState>((set) => ({
    email: "",
    OTP: "",
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    confirmPassword: "",
    setEmail: (email: string) => set({ email }),
    setOTP: (OTP: string) => set({ OTP }),
    setFirstName: (firstName: string) => set({ firstName }),
    setLastName: (lastName: string) => set({ lastName }),
    setUsername: (username: string) => set({ username }),
    setPassword: (password: string) => set({ password }),
    setConfirmPassword: (confirmPassword: string) => set({ confirmPassword }),

    reset: () =>
        set({
            email: "",
            OTP: "",
            firstName: "",
            lastName: "",
            username: "",
            password: "",
            confirmPassword: "",
        }),
}));

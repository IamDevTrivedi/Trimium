import { create } from "zustand";

export interface ResetPasswordState {
    identity: string;
    setIdentity: (identity: string) => void;

    OTP: string;
    setOTP: (OTP: string) => void;

    password: string;
    setPassword: (password: string) => void;

    confirmPassword: string;
    setConfirmPassword: (confirmPassword: string) => void;

    reset: () => void;
}

export const useResetPasswordStore = create<ResetPasswordState>((set) => ({
    identity: "",
    setIdentity: (identity: string) => set({ identity }),
    OTP: "",
    setOTP: (OTP: string) => set({ OTP }),
    password: "",
    setPassword: (password: string) => set({ password }),
    confirmPassword: "",
    setConfirmPassword: (confirmPassword: string) => set({ confirmPassword }),

    reset: () =>
        set({
            identity: "",
            OTP: "",
            password: "",
            confirmPassword: "",
        }),
}));

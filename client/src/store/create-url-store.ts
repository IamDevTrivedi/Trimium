import { create } from "zustand";

export interface CreateURLStore {
    title: string;
    setTitle: (title: string) => void;

    description: string;
    setDescription: (description: string) => void;

    originalURL: string;
    setOriginalURL: (originalURL: string) => void;

    shortcode: string;
    setShortcode: (shortcode: string) => void;

    isLimited: boolean;
    setIsLimited: (isLimited: boolean) => void;
    maxTransfers: number;
    setMaxTransfers: (maxTransfers: number) => void;

    isPasswordProtected: boolean;
    setIsPasswordProtected: (isPasswordProtected: boolean) => void;
    password: string;
    setPassword: (password: string) => void;

    isScheduled: boolean;
    setIsScheduled: (isScheduled: boolean) => void;
    startAt: string | null;
    setStartAt: (startAt: string | null) => void;
    endAt: string | null;
    setEndAt: (endAt: string | null) => void;
    showCountdown: boolean;
    setShowCountdown: (showCountdown: boolean) => void;
    messageToDisplay: string;
    setMessageToDisplay: (messageToDisplay: string) => void;

    reset: () => void;
}

export const useCreateURLStore = create<CreateURLStore>((set) => ({
    title: "",
    setTitle: (title) => set({ title }),

    description: "",
    setDescription: (description) => set({ description }),

    originalURL: "",
    setOriginalURL: (originalURL) => set({ originalURL }),

    shortcode: "",
    setShortcode: (shortcode) => set({ shortcode }),

    isLimited: false,
    setIsLimited: (isLimited) => set({ isLimited }),
    maxTransfers: 0,
    setMaxTransfers: (maxTransfers) => set({ maxTransfers }),

    isPasswordProtected: false,
    setIsPasswordProtected: (isPasswordProtected) => set({ isPasswordProtected }),
    password: "",
    setPassword: (password) => set({ password }),
    isScheduled: false,

    setIsScheduled: (isScheduled) => set({ isScheduled }),
    startAt: null,
    setStartAt: (startAt) => set({ startAt }),
    endAt: null,
    setEndAt: (endAt) => set({ endAt }),
    showCountdown: false,
    setShowCountdown: (showCountdown) => set({ showCountdown }),
    messageToDisplay: "",
    setMessageToDisplay: (messageToDisplay) => set({ messageToDisplay }),

    reset: () =>
        set({
            title: "",
            description: "",
            originalURL: "",
            shortcode: "",
            isLimited: false,
            maxTransfers: 0,
            isPasswordProtected: false,
            password: "",
            isScheduled: false,
            startAt: null,
            endAt: null,
            showCountdown: false,
        }),
}));

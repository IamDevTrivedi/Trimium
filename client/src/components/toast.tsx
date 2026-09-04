"use client";
import { toast } from "sonner";

interface ToastOptions {
    description?: string;
    duration?: number;
}

export const dismissAll = () => toast.dismiss();

export const Toast = {
    message: (title: string, options?: ToastOptions) => {
        toast(title, {
            description: options?.description,
            richColors: true,
            dismissible: true,
            closeButton: true,
            duration: options?.duration ?? 3000,
        });
    },

    info: (title: string, options?: ToastOptions) => {
        toast.info(title, {
            description: options?.description,
            richColors: true,
            dismissible: true,
            closeButton: true,
            duration: options?.duration ?? 3000,
        });
    },

    success: (title: string, options?: ToastOptions) => {
        toast.success(title, {
            description: options?.description,
            richColors: true,
            dismissible: true,
            closeButton: true,
            duration: options?.duration ?? 2500,
        });
    },

    warning: (title: string, options?: ToastOptions) => {
        toast.warning(title, {
            description: options?.description,
            richColors: true,
            dismissible: true,
            closeButton: true,
            duration: options?.duration ?? 4000,
        });
    },

    error: (title: string, options?: ToastOptions) => {
        toast.error(title, {
            description: options?.description,
            richColors: true,
            dismissible: true,
            closeButton: true,
            duration: options?.duration ?? 5000,
        });
    },

    loading: (title: string, options?: Pick<ToastOptions, "description">) => {
        return toast.loading(title, {
            description: options?.description ?? "Processing your request...",
            richColors: false,
            dismissible: false,
        });
    },

    dismiss: (id?: number | string) => {
        dismissAll();
        return toast.dismiss(id);
    },
} as const;

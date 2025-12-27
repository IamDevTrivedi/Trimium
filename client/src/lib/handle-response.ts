import { Toast } from "@/components/toast";

type ResponseData = null | {
    success: boolean;
    message: string;
};

export function handleResponse(resData: ResponseData, silent = false): boolean {
    if (!resData) {
        if (silent) return false;
        Toast.error("No response from server.", {
            description: "Please try again.",
        });
        return false;
    }

    const { success, message } = resData;

    if (success) {
        if (!silent) {
            Toast.success(message || "Operation successful.");
        }
        return true;
    }

    if (!silent) {
        Toast.error(message || "Operation failed.", {
            description: "Please try again.",
        });
    }

    return false;
}

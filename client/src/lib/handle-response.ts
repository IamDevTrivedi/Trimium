import { Toast } from "@/components/toast";

type ResponseData = null | {
    success: boolean;
    message: string;
};

export function handleResponse(resData: ResponseData): boolean {
    if (!resData) {
        Toast.error("No response from server.", {
            description: "Please try again.",
        });
        return false;
    }

    const { success, message } = resData;

    if (success) {
        Toast.success(message || "Operation successful.");
        return true;
    }

    Toast.error(message || "Operation failed.", {
        description: "Please try again.",
    });

    return false;
}

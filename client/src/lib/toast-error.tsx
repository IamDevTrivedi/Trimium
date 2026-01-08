import { AxiosError } from "axios";
import { Toast } from "@/components/toast";

type ApiErrorResponse = {
    message?: string;
};

type UseErrorToastOptions = {
    fallbackMessage?: string;
    description?: string;
};

export const toastError = (error: unknown, options?: UseErrorToastOptions) => {
    const { fallbackMessage = "An unexpected error occurred." } = options || {};

    const err = error as AxiosError<ApiErrorResponse>;

    if (err?.response?.data?.message) {
        Toast.error(err.response.data.message);
        return;
    }

    if (err?.message) {
        Toast.error(err.message);
        return;
    }

    Toast.error(fallbackMessage);
};

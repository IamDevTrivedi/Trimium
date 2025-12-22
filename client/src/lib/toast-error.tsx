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
    const { fallbackMessage = "An unexpected error occurred.", description = "Please try again." } =
        options || {};

    const err = error as AxiosError<ApiErrorResponse>;

    if (err?.response?.data?.message) {
        Toast.error(err.response.data.message, { description });
        return;
    }

    if (err?.message) {
        Toast.error(err.message, { description });
        return;
    }

    Toast.error(fallbackMessage, { description });
};

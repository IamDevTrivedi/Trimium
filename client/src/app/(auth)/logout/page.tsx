"use client";

import { LoadingPage } from "@/components/loading";
import { backend } from "@/config/backend";
import { handleResponse } from "@/lib/handle-response";
import { toastError } from "@/lib/toast-error";
import { useCreateAccountStore } from "@/store/create-account-store";
import { useCreateURLStore } from "@/store/create-url-store";
import { useLoginStore } from "@/store/login-store";
import { useResetPasswordStore } from "@/store/reset-password-store";
import { useUserStore } from "@/store/user-store";
import { useRouter } from "next/navigation";
import React from "react";

export default function page() {
    const router = useRouter();

    const { reset: r1 } = useCreateAccountStore();
    const { reset: r2 } = useCreateURLStore();
    const { reset: r3 } = useLoginStore();
    const { reset: r4 } = useResetPasswordStore();
    const { reset: r5 } = useUserStore();

    React.useEffect(() => {
        const fetcher = async () => {
            try {
                const { data: resData } = await backend.post("/api/v1/auth/logout-my-device");

                if (handleResponse(resData)) {
                    r1();
                    r2();
                    r3();
                    r4();
                    r5();
                }
            } catch (error) {
                toastError(error);
            }
            finally {
                router.replace("/");
            }
        };
        fetcher();
    }, []);

    return <LoadingPage />;
}

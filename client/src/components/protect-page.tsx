"use client";

import { backend } from "@/config/backend";
import { useUserStore } from "@/store/user-store";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

export default function ProtectPage({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const { setUser, reset } = useUserStore();
    const router = useRouter();

    React.useEffect(() => {
        const fetcher = async () => {
            try {
                const { data: resData } = await backend.post("/api/v1/auth/me");
                if (resData.success) {
                    setUser(resData.data);
                } else {
                    reset();
                    router.replace("/login");
                }
            } catch (error) {
                reset();
                router.replace("/login");
            }
        };
        fetcher();
    }, [pathname]);

    return <>{children}</>;
}

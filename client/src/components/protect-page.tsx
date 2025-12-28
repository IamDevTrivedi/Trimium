"use client";

import { backend } from "@/config/backend";
import { useUserStore } from "@/store/user-store";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { LoadingPage } from "./loading";

export function ProtectPage({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { setUser, reset } = useUserStore();
    const router = useRouter();
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetcher = async () => {
            try {
                setLoading(true);
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
            } finally {
                setLoading(false);
            }
        };
        fetcher();
    }, [pathname]);

    if (loading) {
        return <LoadingPage />;
    }

    return <>{children}</>;
}

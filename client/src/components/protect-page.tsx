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
        let cancelled = false;
        const fetcher = async () => {
            try {
                setLoading(true);
                const { data: resData } = await backend.get("/api/v1/auth/me");
                if (cancelled) return;
                if (resData.success) {
                    setUser(resData.data);
                    setLoading(false);
                } else {
                    reset();
                    router.replace("/login");
                }
            } catch (error) {
                if (cancelled) return;
                reset();
                router.replace("/login");
            }
        };
        fetcher();
        return () => {
            cancelled = true;
        };
    }, [pathname]);

    if (loading) {
        return <LoadingPage />;
    }

    return <>{children}</>;
}

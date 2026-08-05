"use client";
import { useParams, usePathname, useRouter } from "next/navigation";
import React from "react";
import { LoadingPage } from "./loading";
import { backend } from "@/config/backend";

export function ProtectWorkspace({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const params = useParams();
    const { workspaceID } = params;
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        let cancelled = false;
        const fetcher = async () => {
            try {
                setLoading(true);
                if (!workspaceID) {
                    router.replace("/w");
                    return;
                }

                const { data: resData } = await backend.get(
                    `/api/v1/workspace/${workspaceID}/permission`
                );

                if (resData.success === false) {
                    router.replace("/w");
                    return;
                }

                const { partOf, permission } = resData.data;

                if (!partOf) {
                    router.replace("/w");
                    return;
                }

                if (
                    permission === "viewer" &&
                    requiresEditorPermission(pathname, workspaceID as string)
                ) {
                    router.replace(`/w/${workspaceID}`);
                    return;
                }

                if (cancelled) return;
                setLoading(false);
            } catch (error) {
                if (cancelled) return;
                router.replace("/w");
            }
        };

        fetcher();
        return () => {
            cancelled = true;
        };
    }, [pathname, workspaceID, router]);

    if (loading) {
        return <LoadingPage />;
    }

    return <>{children}</>;
}

function requiresEditorPermission(pathname: string, workspaceID: string): boolean {
    const escapedWorkspaceID = workspaceID.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const createUrlPattern = new RegExp(`^/w/${escapedWorkspaceID}/create-url/?$`);
    const editPattern = new RegExp(`^/w/${escapedWorkspaceID}/[^/]+/edit/?$`);
    return createUrlPattern.test(pathname) || editPattern.test(pathname);
}

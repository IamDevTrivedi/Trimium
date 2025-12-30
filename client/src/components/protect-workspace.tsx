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
        const fetcher = async () => {
            try {
                setLoading(true);
                if (!workspaceID) {
                    router.replace("/w");
                    return;
                }

                // BUG: this is begin called 3 times when person is a viewer

                const { data: resData } = await backend.post(
                    "/api/v1/workspace/workspace-permission",
                    {
                        workspaceID: workspaceID,
                    }
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
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    return;
                }
            } catch (error) {
                router.replace("/w");
            } finally {
                setLoading(false);
            }
        };

        fetcher();
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

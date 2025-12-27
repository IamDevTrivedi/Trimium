"use client";
import { Users, ExternalLink, Shield, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { toastError } from "@/lib/toast-error";
import { backend } from "@/config/backend";
import { handleResponse } from "@/lib/handle-response";
import { LoadingPage } from "./loading";

interface Workspace {
    title: string;
    description: string;
    workspaceID: string;
    permission: "admin" | "editor" | "viewer";
    createdAt: string;
    size: number;
}

export function WorkspaceList() {
    const [workspaceData, setWorkspaceData] = React.useState<Workspace[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);

    React.useEffect(() => {
        const fetcher = async () => {
            try {
                setLoading(true);
                const { data: resData } = await backend.post("/api/v1/workspace/my-workspaces");
                if (handleResponse(resData, true)) {
                    setWorkspaceData(resData.data);
                    console.log(resData.data);
                }
            } catch (error) {
                toastError(error);
            } finally {
                setLoading(false);
            }
        };
        fetcher();
    }, []);

    return (
        <div className="space-y-3">
            {loading && <LoadingPage />}
            {!loading && workspaceData.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed bg-card/50 p-8 text-center">
                    <Shield className="h-12 w-12 text-muted-foreground" />
                    <h3 className="text-lg font-semibold text-foreground">No Workspaces Found</h3>
                    <p className="text-sm text-muted-foreground">
                        You are not a member of any workspaces yet. Create a new workspace to get
                        started.
                    </p>
                    <Button variant="default">
                        <Link href="/w/new" className="flex items-center">
                            Create Workspace
                        </Link>
                    </Button>
                </div>
            )}
            {workspaceData.map((workspace) => (
                <div
                    key={workspace.workspaceID}
                    className="group flex items-center gap-4 rounded-lg border bg-card p-4 transition-all hover:bg-accent/50 hover:shadow-sm"
                >
                    {/* Icon */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <span className="text-lg font-bold">
                            {workspace.title.charAt(0).toUpperCase()}
                        </span>
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{workspace.title}</h3>
                            <PermissionBadge permission={workspace.permission} />
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                            {workspace.description}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Created {formatDate(workspace.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5" />
                                <span>{workspace.size} members</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100"
                        >
                            <Link
                                href={`/w/${workspace.workspaceID}`}
                                className="flex items-center gap-2"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Open
                            </Link>
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}

function PermissionBadge({ permission }: { permission: string }) {
    const variant = permission === "admin" ? "default" : "secondary";

    return (
        <Badge variant={variant} className="text-xs font-medium">
            {permission.charAt(0).toUpperCase() + permission.slice(1)}
        </Badge>
    );
}

function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "today";
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
}

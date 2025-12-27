"use client";

import { Button } from "@/components/ui/button";
import { Calendar, Shield, Mail, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { LoadingPage } from "./loading";
import { toastError } from "@/lib/toast-error";
import { backend } from "@/config/backend";
import { handleResponse } from "@/lib/handle-response";

interface Invitation {
    title: string;
    description: string;
    updatedAt: string;
    _id: string;
    permission: "admin" | "member" | "viewer";
}

export function PendingInvitations() {
    const [invitationData, setInvitationData] = React.useState<Invitation[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);

    React.useEffect(() => {
        const fetcher = async () => {
            try {
                setLoading(true);
                const { data: resData } = await backend.post(
                    "/api/v1/workspace/get-all-invitations"
                );
                if (handleResponse(resData, true)) {
                    setInvitationData(resData.data);
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

    const handleDecision = async (invitationId: string, accept: boolean) => {
        try {
            const { data: resData } = await backend.post(
                "/api/v1/workspace/accept-or-decline-invitation",
                {
                    invitationID: invitationId,
                    accept: accept,
                }
            );

            if (handleResponse(resData)) {
                setInvitationData((prev) =>
                    prev.filter((invitation) => invitation._id !== invitationId)
                );
            }
        } catch (error) {
            toastError(error);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
                <h2 className="text-lg font-semibold tracking-tight">Pending Invitations</h2>
                <p className="text-sm text-muted-foreground">{invitationData.length} pending</p>
            </div>

            <div className="space-y-3">
                {loading && <LoadingPage />}
                {!loading && invitationData.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed bg-card/50 p-8 text-center">
                        <Mail className="h-12 w-12 text-muted-foreground" />
                        <h3 className="text-lg font-semibold text-foreground">
                            No Pending Invitations
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            You have no pending workspace invitations at the moment.
                        </p>
                    </div>
                )}
                {!loading &&
                    invitationData.map((invitation) => (
                        <div
                            key={invitation._id}
                            className="group flex items-center gap-4 rounded-lg border bg-card p-4 transition-all hover:bg-accent/50 hover:shadow-sm"
                        >
                            {/* Icon */}
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Mail className="h-5 w-5" />
                            </div>

                            {/* Content */}
                            <div className="min-w-0 flex-1">
                                <div className="mb-1 flex items-center gap-2">
                                    <h3 className="font-semibold text-foreground">
                                        {invitation.title}
                                    </h3>
                                    <PermissionBadge permission={invitation.permission} />
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                    {invitation.description}
                                </p>
                                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>Received {formatDate(invitation.updatedAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Shield className="h-3.5 w-3.5" />
                                        <span className="capitalize">
                                            {invitation.permission} access
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex shrink-0 items-center gap-2">
                                <Button
                                    variant={"outline"}
                                    size="sm"
                                    onClick={() => handleDecision(invitation._id, false)}
                                >
                                    <X className="h-4 w-4" />
                                    Decline
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => handleDecision(invitation._id, true)}
                                >
                                    <Check className="h-4 w-4" />
                                    Accept
                                </Button>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
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

function PermissionBadge({ permission }: { permission: string }) {
    const variant = permission === "admin" ? "default" : "secondary";

    return (
        <Badge variant={variant} className="text-xs font-medium">
            {permission.charAt(0).toUpperCase() + permission.slice(1)}
        </Badge>
    );
}

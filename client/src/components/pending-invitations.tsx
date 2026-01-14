"use client";

import { Button } from "@/components/ui/button";
import { Calendar, Shield, Mail, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { LoadingPage } from "./loading";
import { toastError } from "@/lib/toast-error";
import { backend } from "@/config/backend";
import { handleResponse } from "@/lib/handle-response";
import { format } from "timeago.js";

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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-4">
                <h2 className="text-base sm:text-lg font-semibold tracking-tight">
                    Pending Invitations
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                    {invitationData.length} pending
                </p>
            </div>

            <div className="space-y-3">
                {loading && <LoadingPage />}
                {!loading && invitationData.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed bg-card/50 p-6 sm:p-8 text-center">
                        <Mail className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
                        <h3 className="text-base sm:text-lg font-semibold text-foreground">
                            No Pending Invitations
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
                            You have no pending workspace invitations at the moment.
                        </p>
                    </div>
                )}
                {!loading &&
                    invitationData.map((invitation) => (
                        <div
                            key={invitation._id}
                            className="group flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 rounded-lg border bg-card p-4 transition-all hover:bg-accent/50 hover:shadow-sm"
                        >
                            {/* Icon */}
                            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>

                            {/* Content */}
                            <div className="min-w-0 flex-1 w-full">
                                <div className="mb-1 flex flex-wrap items-center gap-2">
                                    <h3 className="text-sm sm:text-base font-semibold text-foreground">
                                        {invitation.title}
                                    </h3>
                                    <PermissionBadge permission={invitation.permission} />
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-1">
                                    {invitation.description}
                                </p>
                                <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                                        <span>Received {format(invitation.updatedAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Shield className="h-3.5 w-3.5 shrink-0" />
                                        <span className="capitalize">
                                            {invitation.permission} access
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex w-full sm:w-auto shrink-0 items-center gap-2">
                                <Button
                                    variant={"outline"}
                                    size="sm"
                                    className="flex-1 sm:flex-none"
                                    onClick={() => handleDecision(invitation._id, false)}
                                >
                                    <X className="h-4 w-4" />
                                    <span className="hidden sm:inline">Decline</span>
                                </Button>
                                <Button
                                    size="sm"
                                    className="flex-1 sm:flex-none"
                                    onClick={() => handleDecision(invitation._id, true)}
                                >
                                    <Check className="h-4 w-4" />
                                    <span className="hidden sm:inline">Accept</span>
                                </Button>
                            </div>
                        </div>
                    ))}
            </div>
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

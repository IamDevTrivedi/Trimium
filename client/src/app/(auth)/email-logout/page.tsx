"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { backend } from "@/config/backend";
import { AxiosError } from "axios";

type Status = "loading" | "error" | "success";

export default function EmailLogoutPage() {
    const searchParams = useSearchParams();
    const revokeToken = searchParams.get("revokeToken");

    const [status, setStatus] = useState<Status>("loading");
    const [message, setMessage] = useState<string>("");

    useEffect(() => {
        if (!revokeToken) {
            setStatus("error");
            setMessage("Broken URL. Revoke token is missing.");
            return;
        }

        const logout = async () => {
            try {
                const { data } = await backend.post("/api/v1/auth/email-logout", {
                    revokeToken,
                });

                if (!data || !data.success) {
                    setStatus("error");
                    setMessage(data.message || "Something went wrong");
                    return;
                }

                setStatus("success");
                setMessage(data.message || "Logged out successfully");
            } catch (error: unknown) {
                setStatus("error");
                const err = error as AxiosError<{
                    message?: string;
                }>;
                setMessage(err.response?.data.message || "Failed to process request");
            }
        };

        logout();
    }, [revokeToken]);

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-8">
            <Card className="w-full max-w-lg border-border shadow-sm">
                <CardContent className="flex flex-col items-center justify-center gap-6 py-12 text-center">
                    {status === "loading" && (
                        <>
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-lg font-semibold text-foreground">
                                    Processing
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Processing your logout request...
                                </p>
                            </div>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                                <AlertCircle className="h-8 w-8 text-destructive" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-lg font-semibold text-destructive">
                                    Logout Failed
                                </h2>
                                <p className="text-sm text-muted-foreground">{message}</p>
                            </div>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <CheckCircle2 className="h-8 w-8 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-lg font-semibold text-foreground">
                                    Logged Out
                                </h2>
                                <p className="text-sm text-muted-foreground">{message}</p>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

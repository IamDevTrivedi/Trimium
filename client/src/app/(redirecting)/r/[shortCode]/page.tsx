"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import {
    Loader2,
    Lock,
    Timer,
    AlertCircle,
    Link2,
    ArrowRight,
    ShieldCheck,
    Clock,
} from "lucide-react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { backend } from "@/config/backend";
import { toastError } from "@/lib/toast-error";
import { Toast } from "@/components/toast";
import { PASSWORD, PASSWORD_NOTICE } from "@/constants/regex";

type VERDICT =
    | "INVALID"
    | "INACTIVE"
    | "EXPIRED"
    | "SHOW_COUNTER"
    | "MAX_TRANSFER_REACHED"
    | "SHOW_PASSWORD_PROMPT"
    | "PASSWORD_INCORRECT"
    | "SUCCESS";

function CountdownTimer({
    startAt,
    messageToDisplay,
}: {
    startAt: number;
    messageToDisplay: string;
}) {
    const [timeLeft, setTimeLeft] = useState(() => {
        const now = new Date().getTime();
        const target = new Date(startAt).getTime();
        return Math.max(0, target - now);
    });

    const router = useRouter();

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const target = new Date(startAt).getTime();
            const remaining = Math.max(0, target - now);
            setTimeLeft(remaining);

            if (remaining <= 0) {
                clearInterval(interval);
                router.refresh();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [startAt]);

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return (
        <Card className="w-full max-w-md shadow-xl border-blue-500/20">
            <CardHeader className="text-center">
                <div className="mx-auto bg-blue-500/10 p-3 rounded-full w-fit mb-2">
                    <Timer className="h-8 w-8 text-blue-500" />
                </div>
                <CardTitle className="text-2xl">Scheduled Link</CardTitle>
                <CardDescription>{messageToDisplay}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-center gap-4 text-center">
                    <div className="flex flex-col">
                        <span className="text-3xl font-bold">
                            {days.toString().padStart(2, "0")}
                        </span>
                        <span className="text-xs text-muted-foreground">Days</span>
                    </div>
                    <span className="text-3xl font-bold">:</span>
                    <div className="flex flex-col">
                        <span className="text-3xl font-bold">
                            {hours.toString().padStart(2, "0")}
                        </span>
                        <span className="text-xs text-muted-foreground">Hours</span>
                    </div>
                    <span className="text-3xl font-bold">:</span>
                    <div className="flex flex-col">
                        <span className="text-3xl font-bold">
                            {minutes.toString().padStart(2, "0")}
                        </span>
                        <span className="text-xs text-muted-foreground">Minutes</span>
                    </div>
                    <span className="text-3xl font-bold">:</span>
                    <div className="flex flex-col">
                        <span className="text-3xl font-bold">
                            {seconds.toString().padStart(2, "0")}
                        </span>
                        <span className="text-xs text-muted-foreground">Seconds</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function RedirectPage() {
    const [verdict, setVerdict] = useState<Exclude<VERDICT, "PASSWORD_INCORRECT"> | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [displayContent, setDisplayContent] = useState<any>(null);
    const [originalURL, setOriginalURL] = useState<string | null>(null);
    const [password, setPassword] = useState<string>("");
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const params = useParams();
    const shortCode = params.shortCode as string;

    useEffect(() => {
        const fetcher = async () => {
            try {
                setLoading(true);
                const { data: resData } = await backend.post("/api/v1/url/redirect", {
                    shortCode,
                });

                const verdict = resData.verdict as Exclude<VERDICT, "PASSWORD_INCORRECT">;
                setVerdict(verdict);
                setDisplayContent(resData.displayContent);
                setOriginalURL(resData.originalURL || null);

                if (verdict === "SUCCESS" && resData.originalURL) {
                    window.location.href = resData.originalURL;
                }
            } catch (error) {
                toastError(error);
                notFound();
            } finally {
                setLoading(false);
            }
        };
        fetcher();
    }, [shortCode]);

    const handleSubmit = async () => {
        if (!password) return;

        try {
            setSubmitting(true);
            setError(null);
            const { data: resData } = await backend.post("/api/v1/url/redirect", {
                shortCode,
                password,
            });

            if (resData.verdict === "SUCCESS") {
                window.location.href = resData.originalURL;
            } else if (resData.verdict === "PASSWORD_INCORRECT") {
                setError("Invalid credentials. Access denied.");
            } else {
                Toast.warning(resData.message);
            }
        } catch (error) {
            toastError(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSubmit();
        }
    };

    if (loading || verdict === null) {
        return (
            <main className="min-h-screen w-full flex items-center justify-center p-4 bg-linear-to-b from-background to-muted/20">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse">
                        Securing your connection...
                    </p>
                </div>
            </main>
        );
    }

    const renderContent = () => {
        switch (verdict) {
            case "INACTIVE":
                return (
                    <Card className="w-full max-w-md border-destructive/20 shadow-xl">
                        <CardHeader className="text-center">
                            <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-2">
                                <AlertCircle className="h-8 w-8 text-destructive" />
                            </div>
                            <CardTitle className="text-2xl">Link Inactive</CardTitle>
                            <CardDescription>
                                This link is currently disabled by the owner.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                );

            case "EXPIRED":
                return (
                    <Card className="w-full max-w-md border-muted/50 shadow-xl">
                        <CardHeader className="text-center">
                            <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-2">
                                <Clock className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <CardTitle className="text-2xl">Link Expired</CardTitle>
                            <CardDescription>
                                The time limit for this link has passed.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                );

            case "SHOW_COUNTER": {
                const { startAt, messageToDisplay } = displayContent;
                return <CountdownTimer startAt={startAt} messageToDisplay={messageToDisplay} />;
            }

            case "MAX_TRANSFER_REACHED":
                return (
                    <Card className="w-full max-w-md shadow-xl border-orange-500/20">
                        <CardHeader className="text-center">
                            <div className="mx-auto bg-orange-500/10 p-3 rounded-full w-fit mb-2">
                                <ShieldCheck className="h-8 w-8 text-orange-500" />
                            </div>
                            <CardTitle className="text-2xl">Transfer Limit Reached</CardTitle>
                            <CardDescription>
                                This link has reached its maximum allowed number of uses.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                );

            case "SHOW_PASSWORD_PROMPT": {
                return (
                    <Card className="w-full max-w-md shadow-2xl border-primary/20">
                        <CardHeader className="text-center">
                            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
                                <Lock className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle className="text-2xl">Protected Link</CardTitle>
                            <CardDescription>
                                Authentication required to view this content.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Input
                                        type="password"
                                        placeholder="Enter secure password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyUp={handleKeyPress}
                                        autoFocus
                                    />
                                    {
                                        <p className="text-sm text-muted-foreground">
                                            {PASSWORD_NOTICE}
                                        </p>
                                    }
                                    {error && (
                                        <Alert variant="destructive" className="py-2">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription className="text-xs font-medium">
                                                {error}
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                                <Button
                                    className="w-full"
                                    disabled={submitting || PASSWORD.test(password) === false}
                                    onClick={handleSubmit}
                                    loading={submitting}
                                >
                                    Unlock Link
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                );
            }

            case "INVALID":
                return (
                    <Card className="w-full max-w-md border-destructive/20 shadow-xl">
                        <CardHeader className="text-center">
                            <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-2">
                                <AlertCircle className="h-8 w-8 text-destructive" />
                            </div>
                            <CardTitle className="text-2xl">Invalid Link</CardTitle>
                            <CardDescription>
                                The link you followed is broken or doesn't exist.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => router.push("/")}
                            >
                                Return Home
                            </Button>
                        </CardFooter>
                    </Card>
                );

            case "SUCCESS":
                return (
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="bg-primary/20 p-4 rounded-full animate-bounce">
                            <ArrowRight className="h-10 w-10 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold">Redirecting...</h2>
                        <p className="text-muted-foreground">Taking you to your destination now.</p>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <main className="min-h-screen w-full flex items-center justify-center p-4 bg-linear-to-b from-background to-muted/20">
            {renderContent()}
        </main>
    );
}

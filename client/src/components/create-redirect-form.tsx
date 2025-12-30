"use client";

import { Calendar, Clock, Link2, Lock, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import config from "@/config/env";
import { useCreateURLStore } from "@/store/create-url-store";
import { z } from "zod";
import { PASSWORD, PASSWORD_NOTICE } from "@/constants/regex";
import React from "react";
import { toastError } from "@/lib/toast-error";
import { backend } from "@/config/backend";
import { Toast } from "./toast";
import { handleResponse } from "@/lib/handle-response";
import { useParams, useRouter } from "next/navigation";

interface formErrors {
    title?: string;
    description?: string;
    originalURL?: string;
    shortcode?: string;
    maxTransfers?: string;
    password?: string;
    startAt?: string;
    endAt?: string;
}

type shortCodeAvailability = "available" | "unavailable" | "checking" | null;

export function CreateRedirectForm() {
    const [errors, setErrors] = React.useState<formErrors>({});
    const [loading, setLoading] = React.useState<boolean>(false);
    const [success, setSuccess] = React.useState<string | false>(false);
    const [shortcodeStatus, setShortcodeStatus] = React.useState<shortCodeAvailability>(null);
    const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

    const router = useRouter();

    const params = useParams();
    const workspaceID = params.workspaceID as string;

    const {
        title,
        setTitle,

        description,
        setDescription,

        originalURL,
        setOriginalURL,

        shortcode,
        setShortcode,

        isLimited,
        setIsLimited,

        maxTransfers,
        setMaxTransfers,

        isPasswordProtected,
        setIsPasswordProtected,

        password,
        setPassword,

        isScheduled,
        setIsScheduled,

        startAt,
        setStartAt,

        endAt,
        setEndAt,

        showCountdown,
        setShowCountdown,

        messageToDisplay,
        setMessageToDisplay,

        reset,
    } = useCreateURLStore();

    const validators = (): boolean => {
        const errors: formErrors = {};

        if (title.length > 255 || title.length === 0) {
            errors.title = "Title must be between 1 and 255 characters.";
        }

        if (description.length > 1024) {
            errors.description = "Description cannot exceed 1024 characters.";
        }

        if (z.url().safeParse(originalURL).success === false) {
            errors.originalURL = "Please enter a valid URL.";
        }

        if (PASSWORD.test(password) === false && isPasswordProtected) {
            errors.password = PASSWORD_NOTICE;
        }

        if (z.int().safeParse(maxTransfers).success === false && isLimited) {
            errors.maxTransfers = "Max Transfers must be a valid integer.";
        }

        if (isScheduled) {
            if (!startAt) {
                errors.startAt = "Start date is required when scheduling is enabled.";
            }

            if (!endAt) {
                errors.endAt = "End date is required when scheduling is enabled.";
            }

            if (startAt && endAt && startAt >= endAt) {
                errors.endAt = "End date must be after start date.";
            }
        }

        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validators()) {
            return;
        }

        await new Promise((resolve) => setTimeout(resolve, 500));

        if (shortcodeStatus !== "available" && shortcode.trim().length > 0) {
            Toast.error("Please choose an available shortcode before submitting.");
            return;
        }

        const payload = {
            workspaceID: workspaceID,
            shortCode: shortcode.trim().length > 0 ? shortcode.trim() : undefined,
            originalURL: originalURL.trim(),
            title: title.trim(),
            description: description.trim().length > 0 ? description.trim() : undefined,
            password: isPasswordProtected ? password : undefined,
            maxTransfers: isLimited ? maxTransfers : undefined,
            schedule: isScheduled
                ? {
                      startAt: new Date(startAt! + ":00.000Z").toISOString(),
                      endAt: new Date(endAt! + ":00.000Z").toISOString(),
                      countdownEnabled: showCountdown,
                      messageToDisplay:
                          messageToDisplay.trim().length > 0
                              ? messageToDisplay.trim()
                              : "This link is not yet active.",
                  }
                : undefined,
        };

        try {
            setLoading(true);
            const { data: resData } = await backend.post("/api/v1/url/create-shortcode", payload);

            if (handleResponse(resData)) {
                reset();
                setSuccess(resData.data.shortCode);
            }
        } catch (error) {
            toastError(error);
        } finally {
            setLoading(false);
        }
    };

    const checkShortcodeAvailability = async (code: string): Promise<shortCodeAvailability> => {
        if (code.trim().length <= 4) {
            setErrors({
                ...errors,
                shortcode: "Shortcode must be at least 5 characters long.",
            });

            setShortcodeStatus(null);
            return null;
        } else if (code.trim().length > 20) {
            setErrors({
                ...errors,
                shortcode: "Shortcode cannot exceed 20 characters.",
            });

            setShortcodeStatus(null);
            return null;
        }

        try {
            setShortcodeStatus("checking");
            const { data: resData } = await backend.post("/api/v1/url/is-shortcode-available", {
                shortCode: code,
            });

            if (resData?.success) {
                setShortcodeStatus(resData.available ? "available" : "unavailable");
                return resData.available ? "available" : "unavailable";
            } else {
                setShortcodeStatus(null);
                return null;
            }
        } catch (error) {
            setShortcodeStatus(null);
            toastError(error);
            return null;
        }
    };

    const handleShortcodeChange = (value: string) => {
        setShortcode(value);

        // Clear shortcode error when user types
        if (errors.shortcode) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.shortcode;
                return newErrors;
            });
        }

        // Clear existing timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Set new timer for debounced check
        debounceTimerRef.current = setTimeout(() => {
            if (value.trim().length > 0) {
                checkShortcodeAvailability(value);
            } else {
                setShortcodeStatus(null);
            }
        }, 500);
    };

    // Cleanup timer on unmount
    React.useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const ShowStatus = () => {
        if (shortcodeStatus === "checking") {
            return <p className="text-xs text-muted-foreground">Checking availability...</p>;
        }

        if (shortcodeStatus === "available") {
            return <p className="text-xs text-green-500">Shortcode is available!</p>;
        }

        if (shortcodeStatus === "unavailable") {
            return <p className="text-xs text-destructive">Shortcode is already taken.</p>;
        }

        return null;
    };

    return (
        <div>
            <div>
                <Button variant="link" className="mb-6" onClick={() => router.back()}>
                    &larr; Back
                </Button>
            </div>
            <Card className="max-w-5xl mx-auto border-none shadow-none md:shadow-sm md:border">
                <CardHeader className="space-y-1">
                    <div className="flex items-center gap-2 text-primary mb-2">
                        <Zap className="h-5 w-5" />
                        <span className="text-sm font-medium uppercase tracking-wider">
                            Quick Create
                        </span>
                    </div>
                    <CardTitle className="text-2xl font-bold">Create New Redirect</CardTitle>
                    <CardDescription>
                        Fill in the details below to create a new short URL and manage its behavior.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Section: Create new URL */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-tight">
                            <Link2 className="h-4 w-4" />
                            Basic Information
                        </div>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Summer Campaign 2024"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                                {errors.title && (
                                    <p className="text-xs text-destructive">{errors.title}</p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="What is this redirect for?"
                                    className="min-h-[100px]"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                                {errors.description && (
                                    <p className="text-xs text-destructive">{errors.description}</p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="original-link">Original Link</Label>
                                <Input
                                    id="original-link"
                                    placeholder="https://your-long-destination-url.com/path"
                                    value={originalURL}
                                    onChange={(e) => setOriginalURL(e.target.value)}
                                />
                                {errors.originalURL && (
                                    <p className="text-xs text-destructive">{errors.originalURL}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    This is the link where your visitors will be redirected to.
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="shortcode">Shortcode</Label>
                                <div className="flex gap-2">
                                    <span className="inline-flex items-center px-3 rounded-md border border-input bg-muted text-muted-foreground text-sm">
                                        {config.PUBLIC_FRONTEND_URL! + "/r/"}
                                    </span>
                                    <Input
                                        id="shortcode"
                                        placeholder="custom-alias"
                                        className={`${shortcodeStatus === "unavailable" ? "border-destructive" : ""} ${shortcodeStatus === "available" ? "border-green-500" : ""} ${shortcodeStatus === "checking" ? "animate-pulse" : ""}`}
                                        value={shortcode}
                                        onChange={(e) => handleShortcodeChange(e.target.value)}
                                    />
                                </div>
                                {errors.shortcode && (
                                    <div className="text-xs text-destructive">
                                        {errors.shortcode}
                                    </div>
                                )}
                                <ShowStatus />
                                <p className="text-xs text-muted-foreground">
                                    The unique identifier for your link. If left blank, we'll
                                    generate a random 7-character string like{" "}
                                    <code className="bg-muted px-1 rounded">x7k29pw</code>.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Section: Add max transfer limits */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-tight">
                                <Shield className="h-4 w-4" />
                                Usage Limits
                            </div>
                            <Switch
                                id="limit-toggle"
                                checked={isLimited}
                                onCheckedChange={(checked) => setIsLimited(checked)}
                            />
                        </div>
                        <div className="grid gap-2 pl-6">
                            <Label htmlFor="max-limit" className="text-sm font-medium">
                                Max Transfer Limit
                            </Label>
                            <Input
                                id="max-limit"
                                type="number"
                                placeholder="Unlimited"
                                className="max-w-[200px]"
                                value={maxTransfers}
                                onChange={(e) => setMaxTransfers(Number(e.target.value))}
                                disabled={!isLimited}
                                min={0}
                            />
                            {errors.maxTransfers && (
                                <p className="text-xs text-destructive">{errors.maxTransfers}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Maximum number of times this link can be visited. Defaults to{" "}
                                <span className="font-medium text-foreground">unlimited</span> if
                                not specified.
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Section: Password Protected Redirect */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-tight">
                                <Lock className="h-4 w-4" />
                                Security
                            </div>
                            <Switch
                                id="password-toggle"
                                checked={isPasswordProtected}
                                onCheckedChange={(checked) => setIsPasswordProtected(checked)}
                            />
                        </div>
                        <div className="grid gap-2 pl-6">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="max-w-[300px]"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={!isPasswordProtected}
                            />
                            {errors.password && (
                                <p className="text-xs text-destructive">{errors.password}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Protect your link with a password. By default, links are{" "}
                                <span className="font-medium text-foreground">
                                    publicly accessible
                                </span>
                                .
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Section: Schedule a Life */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-tight">
                                <Calendar className="h-4 w-4" />
                                Scheduling
                            </div>
                            <Switch
                                id="schedule-toggle"
                                checked={isScheduled}
                                onCheckedChange={(checked) => setIsScheduled(checked)}
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 pl-6">
                            <div className="grid gap-2">
                                <Label htmlFor="start-at">Start At</Label>
                                <div className="relative">
                                    <Input
                                        id="start-at"
                                        type="datetime-local"
                                        className="pl-9"
                                        value={startAt ?? ""}
                                        onChange={(e) => {
                                            setStartAt(e.target.value);
                                            console.log(e.target.value);
                                        }}
                                        disabled={!isScheduled}
                                    />
                                    {errors.startAt && (
                                        <p className="text-xs text-destructive">{errors.startAt}</p>
                                    )}
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="end-at">End At</Label>
                                <div className="relative">
                                    <Input
                                        id="end-at"
                                        type="datetime-local"
                                        className="pl-9"
                                        value={endAt ?? ""}
                                        onChange={(e) => {
                                            setEndAt(e.target.value);
                                            console.log(e.target.value);
                                        }}
                                        disabled={!isScheduled}
                                    />
                                    {errors.endAt && (
                                        <p className="text-xs text-destructive">{errors.endAt}</p>
                                    )}
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground pl-6 -mt-2">
                            Links are active{" "}
                            <span className="font-medium text-foreground">
                                immediately and indefinitely
                            </span>{" "}
                            unless a start or end date is specified.
                        </p>

                        <div className="space-y-3 pl-6">
                            <Label className="text-sm font-medium">
                                Show countdown timer before link activation?
                            </Label>
                            <RadioGroup
                                defaultValue="no"
                                className="flex gap-4"
                                value={showCountdown ? "yes" : "no"}
                                onValueChange={(value) => setShowCountdown(value === "yes")}
                                disabled={isScheduled === false}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="yes" id="timer-yes" />
                                    <Label htmlFor="timer-yes" className="font-normal">
                                        Yes
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="no" id="timer-no" />
                                    <Label htmlFor="timer-no" className="font-normal">
                                        No
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="space-y-3 pl-6">
                            <Label className="text-sm font-medium">
                                Message to display when link is not yet active
                            </Label>
                            <Textarea
                                placeholder="This link is not yet active."
                                value={messageToDisplay}
                                onChange={(e) => setMessageToDisplay(e.target.value)}
                                disabled={isScheduled === false || showCountdown === false}
                            />
                            <p className="text-xs text-muted-foreground">
                                Customize the message shown to users who visit the link before it
                                becomes active.
                            </p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-3 bg-muted/50 p-6">
                    <Button
                        variant="outline"
                        onClick={() => {
                            reset();
                            router.push(`/w/${workspaceID}/`);
                            setSuccess(false);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} loading={loading}>
                        Create Redirect
                    </Button>
                </CardFooter>
            </Card>

            {success !== false && (
                <Card className="max-w-5xl mx-auto mt-6 border-green-500/30 bg-green-500/5 overflow-hidden">
                    <div className="absolute top-0 right-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-green-500/20 blur-3xl" />
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                                <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <CardTitle className="text-lg text-green-700 dark:text-green-300">
                                    Redirect Created Successfully!
                                </CardTitle>
                                <CardDescription>
                                    Your new short link is ready to use
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-background/80 border border-green-500/20">
                            <Link2 className="h-5 w-5 text-muted-foreground shrink-0" />
                            <a
                                href={`${config.PUBLIC_FRONTEND_URL!}/r/${success}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary font-medium hover:underline underline-offset-2 truncate"
                            >
                                {config.PUBLIC_FRONTEND_URL!}/r/{success}
                            </a>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button
                                variant="outline"
                                className="border-green-500/30 hover:bg-green-500/10"
                                onClick={() => {
                                    navigator.clipboard.writeText(
                                        `${config.PUBLIC_FRONTEND_URL!}/r/${success}`
                                    );
                                    Toast.success("Link copied to clipboard!");
                                }}
                            >
                                Copy Link
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => router.push(`/w/${workspaceID}/${success}`)}
                            >
                                View Analytics
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

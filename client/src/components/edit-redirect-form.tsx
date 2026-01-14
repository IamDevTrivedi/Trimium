"use client";

import { useParams, useRouter } from "next/navigation";
import React from "react";
import { LoadingPage } from "./loading";
import { toastError } from "@/lib/toast-error";
import { backend } from "@/config/backend";
import { handleResponse } from "@/lib/handle-response";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Textarea } from "./ui/textarea";
import { Calendar, Clock, LifeBuoy, Link2, Lock, Shield, Zap } from "lucide-react";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import config from "@/config/env";
import { z } from "zod";
import { PASSWORD, PASSWORD_NOTICE } from "@/constants/regex";
import TopBackButton from "./top-back-button";
import { numberToDatetimeLocal } from "@/lib/date";

interface FormErrors {
    title?: string;
    description?: string;
    originalURL?: string;
    maxTransfers?: string;
    password?: string;
    startAt?: string;
    endAt?: string;
}

interface ShortCodeInfo {
    _id: string;
    workspaceID: string;
    title: string;
    description: string;
    shortCode: string;
    originalURL: string;
    isActive: boolean;

    passwordProtect: {
        isEnabled: boolean;
        passwordHash: string;
    };

    transfer: {
        isEnabled: boolean;
        maxTransfers: number;
    };

    schedule: {
        isEnabled: boolean;
        startAt: number;
        endAt: number;
        countdownEnabled: boolean;
        messageToDisplay: string;
    };

    createdAt: string;
    updatedAt: string;

    __v: number;
}

export function EditRedirectForm() {
    const [shortCodeInfo, setShortCodeInfo] = React.useState<ShortCodeInfo | null>(null);
    const [updateShortCodeInfo, setUpdateShortCodeInfo] = React.useState<ShortCodeInfo | null>(
        null
    );
    const [loadingInfo, setLoadingInfo] = React.useState<boolean>(true);
    const [isSubmtting, setIsSubmitting] = React.useState<boolean>(false);
    const [changes, setChanges] = React.useState<boolean>(false);
    const [password, setPassword] = React.useState<string>("");

    const [formErrors, setFormErrors] = React.useState<FormErrors>({});

    const params = useParams();
    const { workspaceID, shortCode } = params;

    const router = useRouter();

    React.useEffect(() => {
        setChanges(JSON.stringify(shortCodeInfo) !== JSON.stringify(updateShortCodeInfo));
    }, [shortCodeInfo, updateShortCodeInfo]);

    React.useEffect(() => {
        setFormErrors({});
    }, [updateShortCodeInfo, password]);

    React.useEffect(() => {
        const fetcher = async () => {
            try {
                setLoadingInfo(true);

                const { data: resData } = await backend.post("/api/v1/url/get-shortcode-info", {
                    shortCode,
                });

                if (!handleResponse(resData, true)) {
                    router.push(`/w/${workspaceID}/`);
                } else {
                    setShortCodeInfo(resData.data);
                    setUpdateShortCodeInfo(resData.data);
                }
            } catch (error) {
                router.push(`/w/${workspaceID}/`);
                toastError(error);
            } finally {
                setLoadingInfo(false);
            }
        };
        fetcher();
    }, [workspaceID, shortCode]);

    const validator = () => {
        const errors: FormErrors = {};
        const up = updateShortCodeInfo!;

        if (up.title.length === 0) {
            errors.title = "Title cannot be empty.";
        }

        if (up.title.length > 255) {
            errors.title = "Title cannot exceed 255 characters.";
        }

        if (up.description.length > 1024) {
            errors.description = "Description cannot exceed 1024 characters.";
        }

        if (z.url().safeParse(up.originalURL).success === false) {
            errors.originalURL = "Please enter a valid URL.";
        }

        if (up.transfer.isEnabled) {
            if (z.int().nonnegative().safeParse(up.transfer.maxTransfers).success === false) {
                errors.maxTransfers = "Please enter a valid non-negative integer.";
            }
        }

        if (up.passwordProtect.isEnabled && shortCodeInfo?.passwordProtect.isEnabled === false) {
            if (PASSWORD.test(password) === false) {
                errors.password = PASSWORD_NOTICE;
            }
        }

        if (up.schedule.isEnabled) {
            const now = Date.now();

            if (now > up.schedule.startAt) {
                errors.startAt = "Start time must be in the future.";
            } else if (now > up.schedule.endAt) {
                errors.endAt = "End time must be in the future.";
            } else if (up.schedule.startAt >= up.schedule.endAt) {
                errors.endAt = "End time must be after Start time.";
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validator()) {
            return;
        }

        const payload = {
            shortCode: shortCode,

            title:
                shortCodeInfo?.title === updateShortCodeInfo?.title
                    ? undefined
                    : updateShortCodeInfo?.title,
            description:
                shortCodeInfo?.description === updateShortCodeInfo?.description
                    ? undefined
                    : updateShortCodeInfo?.description,
            originalURL:
                shortCodeInfo?.originalURL === updateShortCodeInfo?.originalURL
                    ? undefined
                    : updateShortCodeInfo?.originalURL,

            isActive:
                shortCodeInfo?.isActive === updateShortCodeInfo?.isActive
                    ? undefined
                    : updateShortCodeInfo?.isActive,

            password:
                updateShortCodeInfo?.passwordProtect.isEnabled &&
                shortCodeInfo?.passwordProtect.isEnabled === false
                    ? password
                    : undefined,
            maxTransfers: updateShortCodeInfo?.transfer.isEnabled
                ? updateShortCodeInfo.transfer.maxTransfers
                : undefined,

            schedule:
                updateShortCodeInfo?.schedule.isEnabled &&
                (shortCodeInfo?.schedule.startAt !== updateShortCodeInfo?.schedule.startAt ||
                    shortCodeInfo?.schedule.endAt !== updateShortCodeInfo?.schedule.endAt ||
                    shortCodeInfo?.schedule.countdownEnabled !==
                        updateShortCodeInfo?.schedule.countdownEnabled ||
                    shortCodeInfo?.schedule.messageToDisplay !==
                        updateShortCodeInfo?.schedule.messageToDisplay)
                    ? {
                          startAt: updateShortCodeInfo?.schedule.startAt,
                          endAt: updateShortCodeInfo?.schedule.endAt,
                          countdownEnabled: updateShortCodeInfo?.schedule.countdownEnabled,
                          messageToDisplay: updateShortCodeInfo?.schedule.messageToDisplay,
                      }
                    : undefined,

            rmSchedule: !updateShortCodeInfo?.schedule.isEnabled,
            rmPassword: !updateShortCodeInfo?.passwordProtect.isEnabled,
            rmTransferLimit: !updateShortCodeInfo?.transfer.isEnabled,
        };

        try {
            setIsSubmitting(true);
            const { data: resData } = await backend.post("/api/v1/url/edit-shortcode", payload);
            if (handleResponse(resData)) {
                router.push(`/w/${workspaceID}/${shortCode}`);
            }
        } catch (error) {
            toastError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingInfo || !shortCodeInfo) {
        return <LoadingPage />;
    }

    return (
        <div>
            <div>
                <TopBackButton />
            </div>
            <Card className="max-w-5xl mx-auto border-none shadow-none md:shadow-sm md:border">
                <CardHeader className="space-y-1">
                    <div className="flex items-center gap-2 text-primary mb-2">
                        <Zap className="h-5 w-5" />
                        <span className="text-sm font-medium uppercase tracking-wider">
                            Quick Edit
                        </span>
                    </div>
                    <CardTitle className="text-2xl font-bold">Edit Redirect</CardTitle>
                    <CardDescription>
                        Modify the settings of your existing redirect link below.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
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
                                    value={updateShortCodeInfo?.title}
                                    onChange={(e) => {
                                        setUpdateShortCodeInfo({
                                            ...updateShortCodeInfo!,
                                            title: e.target.value,
                                        });
                                    }}
                                />
                                {formErrors.title && (
                                    <p className="text-xs text-destructive">{formErrors.title}</p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="What is this redirect for?"
                                    className="min-h-[100px]"
                                    value={updateShortCodeInfo?.description}
                                    onChange={(e) => {
                                        setUpdateShortCodeInfo({
                                            ...updateShortCodeInfo!,
                                            description: e.target.value,
                                        });
                                    }}
                                />
                                {formErrors.description && (
                                    <p className="text-xs text-destructive">
                                        {formErrors.description}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="original-link">Original Link</Label>
                                <Input
                                    id="original-link"
                                    placeholder="https://your-long-destination-url.com/path"
                                    value={updateShortCodeInfo?.originalURL}
                                    onChange={(e) => {
                                        setUpdateShortCodeInfo({
                                            ...updateShortCodeInfo!,
                                            originalURL: e.target.value,
                                        });
                                    }}
                                />
                                {formErrors.originalURL && (
                                    <p className="text-xs text-destructive">
                                        {formErrors.originalURL}
                                    </p>
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
                                        disabled
                                        value={updateShortCodeInfo?.shortCode}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    ShortCode cannot be changed once created.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Section: Activate / Deactivate Link */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-tight">
                                <LifeBuoy className="h-4 w-4" />
                                Link Status
                            </div>
                            <Switch
                                id="limit-toggle"
                                checked={updateShortCodeInfo?.isActive}
                                onCheckedChange={(e) => {
                                    setUpdateShortCodeInfo({
                                        ...updateShortCodeInfo!,
                                        isActive: e as boolean,
                                    });
                                }}
                            />
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
                                checked={updateShortCodeInfo?.transfer.isEnabled}
                                onCheckedChange={(e) => {
                                    setUpdateShortCodeInfo({
                                        ...updateShortCodeInfo!,
                                        transfer: {
                                            ...updateShortCodeInfo!.transfer,
                                            isEnabled: e as boolean,
                                        },
                                    });
                                }}
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
                                min={0}
                                disabled={!updateShortCodeInfo?.transfer.isEnabled}
                                value={
                                    updateShortCodeInfo?.transfer.isEnabled
                                        ? updateShortCodeInfo.transfer.maxTransfers
                                        : ""
                                }
                                onChange={(e) => {
                                    setUpdateShortCodeInfo({
                                        ...updateShortCodeInfo!,
                                        transfer: {
                                            ...updateShortCodeInfo!.transfer,
                                            maxTransfers: Number(e.target.value),
                                        },
                                    });
                                }}
                            />
                            {formErrors.maxTransfers && (
                                <p className="text-xs text-destructive">
                                    {formErrors.maxTransfers}
                                </p>
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
                                checked={updateShortCodeInfo?.passwordProtect.isEnabled}
                                onCheckedChange={(e) => {
                                    setUpdateShortCodeInfo({
                                        ...updateShortCodeInfo!,
                                        passwordProtect: {
                                            ...updateShortCodeInfo!.passwordProtect,
                                            isEnabled: e as boolean,
                                        },
                                    });
                                }}
                            />
                        </div>
                        <div className="grid gap-2 pl-6">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="max-w-[300px]"
                                disabled={!updateShortCodeInfo?.passwordProtect.isEnabled}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {formErrors.password && (
                                <p className="text-xs text-destructive">{formErrors.password}</p>
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
                                checked={updateShortCodeInfo?.schedule.isEnabled}
                                onCheckedChange={(e) => {
                                    setUpdateShortCodeInfo({
                                        ...updateShortCodeInfo!,
                                        schedule: {
                                            ...updateShortCodeInfo!.schedule,
                                            isEnabled: e as boolean,
                                        },
                                    });
                                }}
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
                                        disabled={!updateShortCodeInfo?.schedule.isEnabled}
                                        value={numberToDatetimeLocal(
                                            updateShortCodeInfo?.schedule.startAt
                                        )}
                                        onChange={(e) => {
                                            const target = e.target.value;
                                            setUpdateShortCodeInfo({
                                                ...updateShortCodeInfo!,
                                                schedule: {
                                                    ...updateShortCodeInfo!.schedule,
                                                    startAt: new Date(target).getTime(),
                                                },
                                            });
                                        }}
                                    />
                                    {formErrors.startAt && (
                                        <p className="text-xs text-destructive">
                                            {formErrors.startAt}
                                        </p>
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
                                        disabled={!updateShortCodeInfo?.schedule.isEnabled}
                                        value={numberToDatetimeLocal(
                                            updateShortCodeInfo?.schedule.endAt
                                        )}
                                        onChange={(e) => {
                                            const target = e.target.value;

                                            setUpdateShortCodeInfo({
                                                ...updateShortCodeInfo!,
                                                schedule: {
                                                    ...updateShortCodeInfo!.schedule,
                                                    endAt: new Date(target).getTime(),
                                                },
                                            });
                                        }}
                                    />
                                    {formErrors.endAt && (
                                        <p className="text-xs text-destructive">
                                            {formErrors.endAt}
                                        </p>
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
                                disabled={!updateShortCodeInfo?.schedule.isEnabled}
                                value={
                                    updateShortCodeInfo?.schedule.countdownEnabled ? "yes" : "no"
                                }
                                onValueChange={(value) => {
                                    setUpdateShortCodeInfo({
                                        ...updateShortCodeInfo!,
                                        schedule: {
                                            ...updateShortCodeInfo!.schedule,
                                            countdownEnabled: value === "yes",
                                        },
                                    });
                                }}
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
                                disabled={!updateShortCodeInfo?.schedule.isEnabled}
                                value={
                                    updateShortCodeInfo?.schedule.isEnabled
                                        ? updateShortCodeInfo.schedule.messageToDisplay
                                        : ""
                                }
                                onChange={(e) => {
                                    setUpdateShortCodeInfo({
                                        ...updateShortCodeInfo!,
                                        schedule: {
                                            ...updateShortCodeInfo!.schedule,
                                            messageToDisplay: e.target.value,
                                        },
                                    });
                                }}
                            />
                            <p className="text-xs text-muted-foreground">
                                Customize the message shown to users who visit the link before it
                                becomes active.
                            </p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-3 bg-muted/50 p-6">
                    <Button variant="outline">Cancel</Button>
                    <Button disabled={!changes} onClick={handleSubmit} loading={isSubmtting}>
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

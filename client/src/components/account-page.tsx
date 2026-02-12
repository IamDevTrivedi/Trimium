"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/user-store";
import { Calendar, Mail, Hash, BadgeCheck, Eye, EyeOff, Link2 } from "lucide-react";
import { NAME, NAME_NOTICE, PASSWORD, USERNAME, USERNAME_NOTICE } from "@/constants/regex";
import { toastError } from "@/lib/toast-error";
import { backend } from "@/config/backend";
import { handleResponse } from "@/lib/handle-response";
import { useRouter } from "next/navigation";
import { LoadingPage } from "./loading";
import TopBackButton from "./top-back-button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FormErrors {
    firstName?: string;
    lastName?: string;
    username?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}

type UsernameAvailability = "available" | "unavailable" | "checking" | null;

const StatusMessage = ({ availability }: { availability: UsernameAvailability }) => {
    if (availability === "checking") {
        return <p className="text-sm text-yellow-500">Checking availability...</p>;
    } else if (availability === "available") {
        return <p className="text-sm text-green-500">Username is available!</p>;
    } else if (availability === "unavailable") {
        return <p className="text-sm text-destructive">Username is taken.</p>;
    } else {
        return null;
    }
};

export function AccountPage() {
    const { user, setUser } = useUserStore();
    const router = useRouter();

    const [nameState, setNameState] = useState({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
    });

    const [usernameState, setUsernameState] = useState({
        value: user?.username || "",
        availability: null as UsernameAvailability,
    });

    React.useEffect(() => {
        setNameState({
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
        });
        setUsernameState({
            value: user?.username || "",
            availability: null,
        });
    }, [user]);

    const [passwordState, setPasswordState] = useState({
        current: "",
        new: "",
        confirm: "",
        showCurrent: false,
        showNew: false,
        showConfirm: false,
    });

    const [formError, setFormError] = useState<FormErrors>({});
    const [loading, setLoading] = useState({
        name: false,
        username: false,
        password: false,
        logoutAll: false,
    });
    const [logoutAllDialogOpen, setLogoutAllDialogOpen] = useState(false);

    const nameChanged = useMemo(
        () => nameState.firstName !== user?.firstName || nameState.lastName !== user?.lastName,
        [nameState.firstName, nameState.lastName, user?.firstName, user?.lastName]
    );

    const usernameChanged = useMemo(
        () => usernameState.value !== user?.username,
        [usernameState.value, user?.username]
    );

    const passwordsValid = useMemo(
        () => passwordState.current && passwordState.new && passwordState.confirm,
        [passwordState.current, passwordState.new, passwordState.confirm]
    );

    const clearError = useCallback((field: keyof FormErrors) => {
        setFormError((prev) => {
            const { [field]: _, ...rest } = prev;
            return rest;
        });
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            timeZoneName: "short",
        });
    };

    if (!user) {
        return <LoadingPage />;
    }

    const handleSaveName = async () => {
        if (!NAME.test(nameState.firstName)) {
            setFormError({ firstName: NAME_NOTICE });
            return;
        }

        if (!NAME.test(nameState.lastName)) {
            setFormError({ lastName: NAME_NOTICE });
            return;
        }

        try {
            setLoading((prev) => ({ ...prev, name: true }));
            const { data: resData } = await backend.post("/api/v1/user/change-name", {
                firstName: nameState.firstName,
                lastName: nameState.lastName,
            });

            if (handleResponse(resData)) {
                setUser({
                    ...user,
                    firstName: nameState.firstName,
                    lastName: nameState.lastName,
                });
            }
        } catch (error) {
            toastError(error);
        }
        finally {
            setLoading((prev) => ({ ...prev, name: false }));
        }
    };

    const handleCancelName = () => {
        setNameState({
            firstName: user.firstName,
            lastName: user.lastName,
        });
    };

    const handleUsernameChange = async (value: string) => {
        setUsernameState((prev) => ({ ...prev, value }));
        clearError("username");

        try {
            if (!USERNAME.test(value)) {
                setUsernameState((prev) => ({ ...prev, availability: null }));
                return;
            }

            setUsernameState((prev) => ({ ...prev, availability: "checking" }));

            const { data: resData } = await backend.post("/api/v1/auth/check-username", {
                usernameToCheck: value,
            });

            if (resData.success) {
                const { available } = resData;
                setUsernameState((prev) => ({
                    ...prev,
                    availability: available ? "available" : "unavailable",
                }));
            }
        } catch (error) {
            setUsernameState((prev) => ({ ...prev, availability: "unavailable" }));
        }
    };

    const handleSaveUsername = async () => {
        if (!USERNAME.test(usernameState.value)) {
            setFormError({ username: USERNAME_NOTICE });
            return;
        }

        await new Promise((resolve) => setTimeout(resolve, 150));

        if (usernameState.availability !== "available") {
            return;
        }

        try {
            setLoading((prev) => ({ ...prev, username: true }));
            const { data: resData } = await backend.post("/api/v1/user/change-username", {
                newUsername: usernameState.value,
            });

            if (handleResponse(resData)) {
                setUser({
                    ...user,
                    username: usernameState.value,
                });
            } else {
                setUsernameState((prev) => ({ ...prev, value: user.username }));
            }
        } catch (error) {
            setUsernameState((prev) => ({ ...prev, value: user.username }));
            toastError(error);
        }
    };

    const handleCancelUsername = () => {
        setUsernameState({
            value: user.username,
            availability: null,
        });
    };

    const handlePasswordChange = async () => {
        if (!PASSWORD.test(passwordState.current)) {
            setFormError({
                currentPassword:
                    "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
            });
            return;
        }

        if (!PASSWORD.test(passwordState.new)) {
            setFormError({
                newPassword:
                    "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
            });
            return;
        }

        if (!PASSWORD.test(passwordState.confirm) || passwordState.new !== passwordState.confirm) {
            setFormError({ confirmPassword: "Passwords do not match." });
            return;
        }

        try {
            setLoading((prev) => ({ ...prev, password: true }));
            const { data: resData } = await backend.post("/api/v1/user/change-password", {
                currentPassword: passwordState.current,
                newPassword: passwordState.new,
            });

            handleResponse(resData);
        } catch (error) {
            toastError(error);
        } finally {
            setPasswordState({
                current: "",
                new: "",
                confirm: "",
                showCurrent: false,
                showNew: false,
                showConfirm: false,
            });
            setLoading((prev) => ({ ...prev, password: false }));
        }
    };

    const handleLogoutAllDevices = async () => {
        try {
            setLoading((prev) => ({ ...prev, logoutAll: true }));
            const { data: resData } = await backend.post("/api/v1/auth/logout-all-other-devices");
            handleResponse(resData);
        } catch (error) {
            toastError(error);
        } finally {
            setLoading((prev) => ({ ...prev, logoutAll: false }));
            setLogoutAllDialogOpen(false);
        }
    };

    return (
        <>
            <div>
                <TopBackButton />
            </div>
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
                <p className="text-muted-foreground">
                    Manage your account information and settings.
                </p>
            </div>
            <div className="min-h-screen bg-background p-4 py-8">
                <div className="max-w-5xl mx-auto space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your name and personal details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        value={nameState.firstName}
                                        onChange={(e) => {
                                            setNameState((prev) => ({
                                                ...prev,
                                                firstName: e.target.value,
                                            }));
                                            clearError("firstName");
                                        }}
                                    />
                                    {formError.firstName && (
                                        <p className="text-sm text-destructive">
                                            {formError.firstName}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        value={nameState.lastName}
                                        onChange={(e) => {
                                            setNameState((prev) => ({
                                                ...prev,
                                                lastName: e.target.value,
                                            }));
                                            clearError("lastName");
                                        }}
                                    />
                                    {formError.lastName && (
                                        <p className="text-sm text-destructive">
                                            {formError.lastName}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Email
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        value={user.email}
                                        disabled
                                        className="pr-10"
                                    />
                                    <BadgeCheck className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Email cannot be changed
                                </p>
                            </div>

                            {nameChanged && (
                                <div className="flex gap-2 pt-2">
                                    <Button onClick={handleSaveName} loading={loading.name}>
                                        Save Changes
                                    </Button>
                                    <Button variant="outline" onClick={handleCancelName}>
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Username</CardTitle>
                            <CardDescription>Change your username</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="flex items-center gap-2">
                                    <Hash className="h-4 w-4" />
                                    Username
                                </Label>
                                <Input
                                    id="username"
                                    value={usernameState.value}
                                    onChange={(e) => handleUsernameChange(e.target.value)}
                                />
                                {formError.username && (
                                    <p className="text-sm text-destructive">{formError.username}</p>
                                )}
                                {<StatusMessage availability={usernameState.availability} />}
                            </div>

                            {usernameChanged && (
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleSaveUsername}
                                        loading={loading.username}
                                        disabled={usernameState.availability !== "available"}
                                    >
                                        Save Changes
                                    </Button>
                                    <Button variant="outline" onClick={handleCancelUsername}>
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Password</CardTitle>
                            <CardDescription>Change your account password</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <div className="relative">
                                    <Input
                                        id="currentPassword"
                                        type={passwordState.showCurrent ? "text" : "password"}
                                        value={passwordState.current}
                                        onChange={(e) => {
                                            setPasswordState((prev) => ({
                                                ...prev,
                                                current: e.target.value,
                                            }));
                                            clearError("currentPassword");
                                        }}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPasswordState((prev) => ({
                                                ...prev,
                                                showCurrent: !prev.showCurrent,
                                            }))
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {passwordState.showCurrent ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {formError.currentPassword && (
                                    <p className="text-sm text-destructive">
                                        {formError.currentPassword}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        type={passwordState.showNew ? "text" : "password"}
                                        value={passwordState.new}
                                        onChange={(e) => {
                                            setPasswordState((prev) => ({
                                                ...prev,
                                                new: e.target.value,
                                            }));
                                            clearError("newPassword");
                                        }}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPasswordState((prev) => ({
                                                ...prev,
                                                showNew: !prev.showNew,
                                            }))
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {passwordState.showNew ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {formError.newPassword && (
                                    <p className="text-sm text-destructive">
                                        {formError.newPassword}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={passwordState.showConfirm ? "text" : "password"}
                                        value={passwordState.confirm}
                                        onChange={(e) => {
                                            setPasswordState((prev) => ({
                                                ...prev,
                                                confirm: e.target.value,
                                            }));
                                            clearError("confirmPassword");
                                        }}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPasswordState((prev) => ({
                                                ...prev,
                                                showConfirm: !prev.showConfirm,
                                            }))
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {passwordState.showConfirm ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {formError.confirmPassword && (
                                    <p className="text-sm text-destructive">
                                        {formError.confirmPassword}
                                    </p>
                                )}
                            </div>

                            <Button
                                onClick={handlePasswordChange}
                                disabled={!passwordsValid}
                                loading={loading.password}
                            >
                                Update Password
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Account Information</CardTitle>
                            <CardDescription>View your account details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-muted-foreground flex items-center gap-2">
                                    <Hash className="h-4 w-4" />
                                    User ID
                                </Label>
                                <p className="text-sm font-mono text-muted-foreground">
                                    {user._id}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Account Created
                                </Label>
                                <p className="text-sm">{formatDate(user.createdAt)}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Security Information</CardTitle>
                            <CardDescription>
                                Keep track of your account security details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-x-4 gap-2 flex flex-col md:flex-row md:items-center">
                            <Button
                                className={"w-full md:w-auto"}
                                onClick={() => router.push("/account/login-activity")}
                            >
                                Check Login Activity
                            </Button>
                            <AlertDialog open={logoutAllDialogOpen} onOpenChange={setLogoutAllDialogOpen}>
                                <AlertDialogTrigger
                                    render={
                                        <Button
                                            variant="destructive"
                                            loading={loading.logoutAll}
                                        />
                                    }
                                >
                                    Logout all Devices
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Logout from all devices?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will log you out from all other devices. You will
                                            remain logged in on this device. You may need to sign
                                            in again on your other devices.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            variant="destructive"
                                            onClick={handleLogoutAllDevices}
                                        >
                                            Logout All
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Link2 className="h-5 w-5" />
                                LinkHub
                            </CardTitle>
                            <CardDescription>
                                Your personal link-in-bio page to share all your important links
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                className="w-full md:w-auto"
                                onClick={() => router.push("/linkhub-editor")}
                            >
                                Manage your LinkHub
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

"use client";

import { LoadingPage } from "@/components/loading";
import { backend } from "@/config/backend";
import { toastError } from "@/lib/toast-error";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Monitor,
    Smartphone,
    Tablet,
    Globe,
    LogOut,
    Cpu,
    Chromium,
    Calendar,
    Shield,
    CheckCircle,
    XCircle,
    RefreshCw,
    AlertTriangle,
    Wifi,
    LocateIcon,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { handleResponse } from "@/lib/handle-response";
import { useRouter } from "next/navigation";
import TopBackButton from "./top-back-button";
import { format } from "timeago.js";
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

export interface LoginSession {
    parsedUA: {
        ua: string;
        browser: {
            name: string;
            version: string;
            major: string;
        };
        cpu: {
            architecture: string;
        };
        device: {
            type?: string;
            vendor?: string;
            model?: string;
        };
        engine: {
            name: string;
            version: string;
        };
        os: {
            name: string;
            version: string;
        };
    };
    loginHistory: {
        _id: string;
        accountID: string;
        UA: string;
        createdAt: string;
        updatedAt: string;
        lastAccessedAt: number;
        IPAddress: string;
        lat: number;
        lon: number;
        displayName: string;
    };
    isActive: boolean;
    currentDevice: boolean;
}

const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType) {
        case "mobile":
            return <Smartphone className="w-5 h-5" />;
        case "tablet":
            return <Tablet className="w-5 h-5" />;
        case "smarttv":
            return <Monitor className="w-5 h-5" />;
        case "wearable":
            return <Monitor className="w-5 h-5" />;
        default:
            return <Monitor className="w-5 h-5" />;
    }
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const getDeviceTypeLabel = (deviceType?: string) => {
    switch (deviceType) {
        case "mobile":
            return "Mobile";
        case "tablet":
            return "Tablet";
        case "smarttv":
            return "Smart TV";
        case "wearable":
            return "Wearable";
        default:
            return "Desktop";
    }
};

export function LoginHistory() {
    const [loadingPage, setLoadingPage] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);
    const [history, setHistory] = React.useState<LoginSession[]>([]);
    const [loggingOut, setLoggingOut] = React.useState<string | null>(null);
    const [logoutAllDialogOpen, setLogoutAllDialogOpen] = React.useState(false);

    const router = useRouter();

    const fetchHistory = React.useCallback(async (showLoading = true) => {
        if (showLoading) {
            setRefreshing(true);
        }
        try {
            const { data: resData } = await backend.post("/api/v1/auth/login-history");
            if (resData.success) {
                setHistory(resData.data);
            }
        } catch (error) {
            toastError(error);
            router.push("/account");
        } finally {
            setLoadingPage(false);
            setRefreshing(false);
        }
    }, []);

    React.useEffect(() => {
        fetchHistory(false);
    }, [fetchHistory]);

    const handleLogoutSession = async (sessionId: string) => {
        setLoggingOut(sessionId);
        try {
            const { data: resData } = await backend.post("/api/v1/auth/logout-particular-device", {
                targetLoginHistoryID: sessionId,
            });

            if (handleResponse(resData)) {
                setHistory((prev) =>
                    prev.map((session) =>
                        session.loginHistory._id === sessionId
                            ? { ...session, isActive: false }
                            : session
                    )
                );
            }
        } catch (error) {
            toastError(error);
        } finally {
            setLoggingOut(null);
        }
    };

    const handleLogoutAllOthers = async () => {
        try {
            const { data: resData } = await backend.post("/api/v1/auth/logout-all-other-devices");

            if (handleResponse(resData)) {
                setHistory((prev) =>
                    prev.map((session) =>
                        session.currentDevice ? session : { ...session, isActive: false }
                    )
                );
            }
        } catch (error) {
            toastError(error);
        } finally {
            setLogoutAllDialogOpen(false);
        }
    };

    const handleRefresh = () => {
        fetchHistory();
    };

    if (loadingPage) {
        return <LoadingPage />;
    }

    const activeSessions = history.filter((session) => session.isActive);
    const inactiveSessions = history.filter((session) => !session.isActive);
    const currentSession = history.find((session) => session.currentDevice);
    const otherActiveSessions = activeSessions.filter((session) => !session.currentDevice);

    return (
        <div className="mx-auto px-4 py-8 max-w-5xl w-full my-12">
            <div>
                <TopBackButton />
            </div>
            <div className="container">
                <div className="space-y-6">
                    {/* Page Header */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight">Login History</h1>
                            <p className="text-muted-foreground">
                                Review and manage all devices that have accessed your account.
                                Secure your account by logging out suspicious sessions.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                                <RefreshCw
                                    className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                                />
                                {refreshing ? "Refreshing..." : "Refresh"}
                            </Button>
                            {otherActiveSessions.length > 0 && (
                                <AlertDialog
                                    open={logoutAllDialogOpen}
                                    onOpenChange={setLogoutAllDialogOpen}
                                >
                                    <AlertDialogTrigger
                                        render={<Button variant="destructive" className="gap-2" />}
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout All Other Devices
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Logout from all other devices?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will log you out from all other devices. You
                                                will remain logged in on this device. You may need
                                                to sign in again on your other devices.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                variant="destructive"
                                                onClick={handleLogoutAllOthers}
                                            >
                                                Logout All
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Active Sessions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{activeSessions.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    Currently logged in devices
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Devices
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{history.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    All time logged in devices
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Current Session
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {currentSession ? "This Device" : "N/A"}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {currentSession?.parsedUA.os.name || "Not detected"}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Current Session Alert */}
                    {currentSession && (
                        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <AlertTitle className="text-blue-800 dark:text-blue-300">
                                Current Active Session
                            </AlertTitle>
                            <AlertDescription className="text-blue-700 dark:text-blue-400">
                                You are currently logged in on this device. This session will remain
                                active until you log out.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Security Notice */}
                    {otherActiveSessions.length > 0 && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Security Notice</AlertTitle>
                            <AlertDescription>
                                You have {otherActiveSessions.length} other active session
                                {otherActiveSessions.length > 1 ? "s" : ""}. Review them below and
                                log out any unfamiliar devices.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Active Sessions */}
                    {activeSessions.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Active Sessions</h2>
                                <Badge variant="default" className="gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    {activeSessions.length} Active
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {activeSessions.map((session) => (
                                    <SessionCard
                                        key={session.loginHistory._id}
                                        session={session}
                                        onLogout={handleLogoutSession}
                                        loggingOut={loggingOut}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Inactive Sessions */}
                    {inactiveSessions.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Previous Sessions</h2>
                                <Badge variant="secondary" className="gap-1">
                                    <XCircle className="w-3 h-3" />
                                    {inactiveSessions.length} Inactive
                                </Badge>
                            </div>

                            <ScrollArea className="h-[400px] rounded-lg border">
                                <div className="p-4 space-y-4">
                                    {inactiveSessions.map((session) => (
                                        <div
                                            key={session.loginHistory._id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                {getDeviceIcon(session.parsedUA.device.type)}
                                                <div>
                                                    <div className="font-medium">
                                                        {session.parsedUA.device.type
                                                            ? getDeviceTypeLabel(
                                                                  session.parsedUA.device.type
                                                              )
                                                            : "Unknown Device"}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {session.parsedUA.os.name} •{" "}
                                                        {session.parsedUA.browser.name}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {session.loginHistory.displayName} (
                                                        {session.loginHistory.lon} {"lon"},{" "}
                                                        {session.loginHistory.lat} {"lan"})
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        IP Address: {session.loginHistory.IPAddress}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right text-sm text-muted-foreground">
                                                <div>Last active</div>
                                                <div>
                                                    {format(session.loginHistory.lastAccessedAt)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}

                    {/* Empty State */}
                    {history.length === 0 && (
                        <Card className="text-center py-12">
                            <CardContent className="space-y-4">
                                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        No login history found
                                    </h3>
                                    <p className="text-muted-foreground mt-2">
                                        Your login history will appear here once you start using
                                        your account on different devices.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Footer Note */}
                    <div className="text-center text-sm text-muted-foreground pt-8 border-t">
                        <p>
                            For your security, regularly review your login history and log out from
                            unfamiliar devices. Change your password if you notice any suspicious
                            activity.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface SessionCardProps {
    session: LoginSession;
    onLogout: (sessionId: string) => void;
    loggingOut: string | null;
}

function SessionCard({ session, onLogout, loggingOut }: SessionCardProps) {
    return (
        <Card
            className={`overflow-hidden ${session.currentDevice ? "border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/20" : ""}`}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className={`p-2 rounded-lg ${session.currentDevice ? "bg-blue-100 dark:bg-blue-900" : "bg-muted"}`}
                        >
                            {getDeviceIcon(session.parsedUA.device.type)}
                        </div>
                        <div>
                            <CardTitle className="text-base">
                                {session.parsedUA.device.type
                                    ? getDeviceTypeLabel(session.parsedUA.device.type)
                                    : "Unknown Device"}
                            </CardTitle>
                            <CardDescription>
                                {session.parsedUA.device.vendor ||
                                    session.parsedUA.device.model ||
                                    "Unknown model"}
                            </CardDescription>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        {session.currentDevice && (
                            <Badge className="bg-blue-600 hover:bg-blue-700">Current</Badge>
                        )}
                        <Badge variant={session.isActive ? "default" : "secondary"}>
                            {session.isActive ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                <Separator />

                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                        <Chromium className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Browser:</span>
                        <span>
                            {session.parsedUA.browser.name} {session.parsedUA.browser.version}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <Monitor className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">OS:</span>
                        <span>
                            {session.parsedUA.os.name} {session.parsedUA.os.version}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <Cpu className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">CPU:</span>
                        <span>{session.parsedUA.cpu.architecture}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <LocateIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Location:</span>
                        <span>
                            {session.loginHistory.displayName} ({session.loginHistory.lon} {"lon"},{" "}
                            {session.loginHistory.lat} {"lan"})
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <Wifi className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">IP Address:</span>
                        <span>{session.loginHistory.IPAddress}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Last Active:</span>
                        <span>{format(session.loginHistory.lastAccessedAt)}</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pt-3 border-t bg-transparent">
                <div className="w-full flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">
                        Logged in on {formatDate(session.loginHistory.createdAt)}
                    </div>
                    {!session.currentDevice && session.isActive && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onLogout(session.loginHistory._id)}
                            disabled={loggingOut === session.loginHistory._id}
                            loading={loggingOut === session.loginHistory._id}
                            className="gap-2"
                        >
                            Logout
                        </Button>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}

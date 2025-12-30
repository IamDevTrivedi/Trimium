"use client";

import React from "react";
import { Button } from "./ui/button";
import { useParams, useRouter } from "next/navigation";
import { backend } from "@/config/backend";
import { handleResponse } from "@/lib/handle-response";
import { toastError } from "@/lib/toast-error";
import { LoadingPage } from "./loading";
import config from "@/config/env";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "./ui/chart";
import {
    Bar,
    BarChart,
    Line,
    LineChart,
    PolarAngleAxis,
    PolarGrid,
    Radar,
    RadarChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
} from "recharts";
import {
    MousePointerClick,
    Eye,
    Users,
    Link2,
    Calendar,
    Shield,
    Clock,
    Globe,
    Monitor,
    Smartphone,
    Tablet,
    HelpCircle,
    Settings,
} from "lucide-react";

export interface ShortCodePerformanceData {
    title: string;
    description: string;
    createdAt: string;
    originalURL: string;
    isActive: boolean;
    isPasswordProtected: boolean;
    transfer: {
        isEnabled: boolean;
        maxTransfers: number;
    };
    schedule: {
        isEnabled: boolean;
        countdownEnabled: boolean;
        messageToDisplay: string;
        startAt: string;
        endAt: string;
    };
    shortCode: string;
    workspaceID: string;
    totalClicks: number;
    lands: number;
    uniqueVisitors: number;
    locationStats: Record<string, number>;
    deviceStats: {
        desktop: number;
        mobile: number;
        tablet: number;
        others: number;
    };
    browserStats: {
        chrome: number;
        firefox: number;
        safari: number;
        edge: number;
        opera: number;
        others: number;
    };
    dailyStats: {
        date: string;
        totalClicks: number;
        uniqueVisitors: number;
    }[];
    hourlyStats: number[];
    weeklyStats: number[];
}

// Chart configurations
const deviceChartConfig: ChartConfig = {
    desktop: { label: "Desktop", color: "hsl(220, 70%, 50%)" },
    mobile: { label: "Mobile", color: "hsl(160, 60%, 45%)" },
    tablet: { label: "Tablet", color: "hsl(30, 80%, 55%)" },
    others: { label: "Others", color: "hsl(280, 65%, 60%)" },
};

const browserChartConfig: ChartConfig = {
    chrome: { label: "Chrome", color: "hsl(45, 93%, 47%)" },
    firefox: { label: "Firefox", color: "hsl(24, 96%, 53%)" },
    safari: { label: "Safari", color: "hsl(200, 98%, 48%)" },
    edge: { label: "Edge", color: "hsl(165, 82%, 35%)" },
    opera: { label: "Opera", color: "hsl(0, 91%, 59%)" },
    others: { label: "Others", color: "hsl(270, 50%, 60%)" },
};

const dailyChartConfig: ChartConfig = {
    totalClicks: { label: "Total Clicks", color: "hsl(220, 70%, 50%)" },
    uniqueVisitors: { label: "Unique Visitors", color: "hsl(160, 60%, 45%)" },
};

const hourlyChartConfig: ChartConfig = {
    clicks: { label: "Clicks", color: "hsl(220, 70%, 50%)" },
};

const weeklyChartConfig: ChartConfig = {
    clicks: { label: "Clicks", color: "hsl(160, 60%, 45%)" },
};

const locationChartConfig: ChartConfig = {
    clicks: { label: "Clicks", color: "hsl(220, 70%, 50%)" },
};

export function ShortCodePerformance() {
    const router = useRouter();
    const params = useParams();
    const { shortCode } = params;

    const [shortCodeData, setShortCodeData] = React.useState<ShortCodePerformanceData | null>(null);
    const [permission, setPermission] = React.useState<"admin" | "member" | "viewer">("viewer");
    const [loadingData, setLoadingData] = React.useState<boolean>(true);

    React.useEffect(() => {
        const fetcher = async () => {
            try {
                setLoadingData(true);
                const { data: resData } = await backend.post("/api/v1/url/shortcode-performance", {
                    shortCode: shortCode,
                });

                if (handleResponse(resData, true)) {
                    setShortCodeData(resData.data);
                    setPermission(resData.permission);
                    setLoadingData(false);
                } else {
                    router.back();
                }
            } catch (error) {
                toastError(error);
            }
        };
        fetcher();
    }, [shortCode, router]);

    if (loadingData) {
        return <LoadingPage />;
    }

    if (!shortCodeData) {
        return null;
    }

    // Prepare data for charts
    const deviceData = [
        {
            device: "Desktop",
            value: shortCodeData.deviceStats.desktop,
            fill: "var(--color-desktop)",
        },
        { device: "Mobile", value: shortCodeData.deviceStats.mobile, fill: "var(--color-mobile)" },
        { device: "Tablet", value: shortCodeData.deviceStats.tablet, fill: "var(--color-tablet)" },
        { device: "Others", value: shortCodeData.deviceStats.others, fill: "var(--color-others)" },
    ];

    const browserData = [
        {
            browser: "Chrome",
            value: shortCodeData.browserStats.chrome,
            fill: "var(--color-chrome)",
        },
        {
            browser: "Firefox",
            value: shortCodeData.browserStats.firefox,
            fill: "var(--color-firefox)",
        },
        {
            browser: "Safari",
            value: shortCodeData.browserStats.safari,
            fill: "var(--color-safari)",
        },
        { browser: "Edge", value: shortCodeData.browserStats.edge, fill: "var(--color-edge)" },
        { browser: "Opera", value: shortCodeData.browserStats.opera, fill: "var(--color-opera)" },
        {
            browser: "Others",
            value: shortCodeData.browserStats.others,
            fill: "var(--color-others)",
        },
    ];

    const dailyData = shortCodeData.dailyStats.map((stat) => ({
        date: new Date(stat.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        totalClicks: stat.totalClicks,
        uniqueVisitors: stat.uniqueVisitors,
    }));

    const hourlyData = shortCodeData.hourlyStats.map((clicks, hour) => ({
        hour: `${hour.toString().padStart(2, "0")}:00`,
        clicks,
    }));

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyData = shortCodeData.weeklyStats.map((clicks, index) => ({
        day: weekDays[index],
        clicks,
    }));

    // Get top 10 locations
    const locationEntries = Object.entries(shortCodeData.locationStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    const locationData = locationEntries.map(([location, clicks]) => ({
        location,
        clicks,
    }));
    const totalLocations = Object.keys(shortCodeData.locationStats).length;

    return (
        <div className="w-full max-w-5xl px-4 mx-auto pb-10">
            {/* Back Button */}
            <div>
                <Button variant="link" className="mb-6" onClick={() => router.back()}>
                    &larr; Back
                </Button>
            </div>

            <div className="w-full space-y-6">
                {/* Section 1: Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <Link2 className="h-6 w-6" />
                            {shortCodeData.title}
                        </CardTitle>
                        <CardDescription>{shortCodeData.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Original URL:</span>
                                <a
                                    href={shortCodeData.originalURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-primary underline underline-offset-2 truncate max-w-md"
                                >
                                    {shortCodeData.originalURL}
                                </a>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Link2 className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Short URL:</span>
                                <a
                                    href={`${config.PUBLIC_FRONTEND_URL}/r/${shortCodeData.shortCode}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-primary underline underline-offset-2"
                                >
                                    {`${config.PUBLIC_FRONTEND_URL}/r/${shortCodeData.shortCode}`}
                                </a>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Created:</span>
                                <span>
                                    {new Date(shortCodeData.createdAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section 2: Link Settings */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Link Settings
                            </CardTitle>
                            {(permission === "admin" || permission === "member") && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        router.push(
                                            `/w/${shortCodeData.workspaceID}/${shortCodeData.shortCode}/edit`
                                        )
                                    }
                                >
                                    Edit Settings
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4">
                            {/* Active Status */}
                            <div
                                className={`relative overflow-hidden rounded-xl border p-4 transition-all hover:shadow-md ${
                                    shortCodeData.isActive
                                        ? "border-green-500/30 bg-green-500/5"
                                        : "border-red-500/30 bg-red-500/5"
                                }`}
                            >
                                <div
                                    className={`absolute top-0 right-0 h-20 w-20 -translate-y-1/2 translate-x-1/2 rounded-full blur-2xl ${
                                        shortCodeData.isActive ? "bg-green-500/20" : "bg-red-500/20"
                                    }`}
                                />
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`flex h-12 w-12 items-center justify-center rounded-full ${
                                            shortCodeData.isActive
                                                ? "bg-green-500/10"
                                                : "bg-red-500/10"
                                        }`}
                                    >
                                        <div
                                            className={`h-4 w-4 rounded-full ${
                                                shortCodeData.isActive
                                                    ? "bg-green-500 animate-pulse"
                                                    : "bg-red-500"
                                            }`}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Status
                                        </p>
                                        <p
                                            className={`text-lg font-semibold ${
                                                shortCodeData.isActive
                                                    ? "text-green-600 dark:text-green-400"
                                                    : "text-red-600 dark:text-red-400"
                                            }`}
                                        >
                                            {shortCodeData.isActive ? "Active" : "Inactive"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Password Protection */}
                            <div
                                className={`relative overflow-hidden rounded-xl border p-4 transition-all hover:shadow-md ${
                                    shortCodeData.isPasswordProtected
                                        ? "border-amber-500/30 bg-amber-500/5"
                                        : "border-border bg-muted/30"
                                }`}
                            >
                                <div
                                    className={`absolute top-0 right-0 h-20 w-20 -translate-y-1/2 translate-x-1/2 rounded-full blur-2xl ${
                                        shortCodeData.isPasswordProtected
                                            ? "bg-amber-500/20"
                                            : "bg-muted/20"
                                    }`}
                                />
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`flex h-12 w-12 items-center justify-center rounded-full ${
                                            shortCodeData.isPasswordProtected
                                                ? "bg-amber-500/10"
                                                : "bg-muted/50"
                                        }`}
                                    >
                                        <Shield
                                            className={`h-5 w-5 ${
                                                shortCodeData.isPasswordProtected
                                                    ? "text-amber-600 dark:text-amber-400"
                                                    : "text-muted-foreground"
                                            }`}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Password Protection
                                        </p>
                                        <p
                                            className={`text-lg font-semibold ${
                                                shortCodeData.isPasswordProtected
                                                    ? "text-amber-600 dark:text-amber-400"
                                                    : "text-muted-foreground"
                                            }`}
                                        >
                                            {shortCodeData.isPasswordProtected
                                                ? "Protected"
                                                : "Not Protected"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Transfer Settings */}
                            <div
                                className={`relative overflow-hidden rounded-xl border p-4 transition-all hover:shadow-md ${
                                    shortCodeData.transfer.isEnabled
                                        ? "border-blue-500/30 bg-blue-500/5"
                                        : "border-border bg-muted/30"
                                }`}
                            >
                                <div
                                    className={`absolute top-0 right-0 h-20 w-20 -translate-y-1/2 translate-x-1/2 rounded-full blur-2xl ${
                                        shortCodeData.transfer.isEnabled
                                            ? "bg-blue-500/20"
                                            : "bg-muted/20"
                                    }`}
                                />
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`flex h-12 w-12 items-center justify-center rounded-full ${
                                            shortCodeData.transfer.isEnabled
                                                ? "bg-blue-500/10"
                                                : "bg-muted/50"
                                        }`}
                                    >
                                        <Users
                                            className={`h-5 w-5 ${
                                                shortCodeData.transfer.isEnabled
                                                    ? "text-blue-600 dark:text-blue-400"
                                                    : "text-muted-foreground"
                                            }`}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Transfer Limit
                                        </p>
                                        <p
                                            className={`text-lg font-semibold ${
                                                shortCodeData.transfer.isEnabled
                                                    ? "text-blue-600 dark:text-blue-400"
                                                    : "text-muted-foreground"
                                            }`}
                                        >
                                            {shortCodeData.transfer.isEnabled
                                                ? `${shortCodeData.transfer.maxTransfers} Max`
                                                : "Unlimited"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Schedule Settings */}
                            <div
                                className={`relative overflow-hidden rounded-xl border p-4 transition-all hover:shadow-md ${
                                    shortCodeData.schedule.isEnabled
                                        ? "border-purple-500/30 bg-purple-500/5"
                                        : "border-border bg-muted/30"
                                }`}
                            >
                                <div
                                    className={`absolute top-0 right-0 h-20 w-20 -translate-y-1/2 translate-x-1/2 rounded-full blur-2xl ${
                                        shortCodeData.schedule.isEnabled
                                            ? "bg-purple-500/20"
                                            : "bg-muted/20"
                                    }`}
                                />
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                                            shortCodeData.schedule.isEnabled
                                                ? "bg-purple-500/10"
                                                : "bg-muted/50"
                                        }`}
                                    >
                                        <Clock
                                            className={`h-5 w-5 ${
                                                shortCodeData.schedule.isEnabled
                                                    ? "text-purple-600 dark:text-purple-400"
                                                    : "text-muted-foreground"
                                            }`}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Schedule
                                        </p>
                                        <p
                                            className={`text-lg font-semibold ${
                                                shortCodeData.schedule.isEnabled
                                                    ? "text-purple-600 dark:text-purple-400"
                                                    : "text-muted-foreground"
                                            }`}
                                        >
                                            {shortCodeData.schedule.isEnabled
                                                ? "Scheduled"
                                                : "Always Active"}
                                        </p>
                                        {shortCodeData.schedule.isEnabled && (
                                            <div className="mt-3 space-y-2 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs border-purple-500/30 text-purple-600 dark:text-purple-400"
                                                    >
                                                        Countdown:{" "}
                                                        {shortCodeData.schedule.countdownEnabled
                                                            ? "On"
                                                            : "Off"}
                                                    </Badge>
                                                </div>
                                                {shortCodeData.schedule.messageToDisplay && (
                                                    <p className="text-muted-foreground truncate">
                                                        &quot;
                                                        {shortCodeData.schedule.messageToDisplay}
                                                        &quot;
                                                    </p>
                                                )}
                                                <div className="flex flex-col gap-1 text-muted-foreground">
                                                    <span>
                                                        📅 Start:{" "}
                                                        {new Date(
                                                            shortCodeData.schedule.startAt
                                                        ).toLocaleDateString("en-US", {
                                                            month: "short",
                                                            day: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </span>
                                                    <span>
                                                        🏁 End:{" "}
                                                        {new Date(
                                                            shortCodeData.schedule.endAt
                                                        ).toLocaleDateString("en-US", {
                                                            month: "short",
                                                            day: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section 3: Performance Metrics */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Performance Metrics</h2>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-primary/10">
                                        <MousePointerClick className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Total Clicks
                                        </p>
                                        <p className="text-3xl font-bold">
                                            {shortCodeData.totalClicks.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-green-500/10">
                                        <Eye className="h-6 w-6 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Page Lands</p>
                                        <p className="text-3xl font-bold">
                                            {shortCodeData.lands.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-orange-500/10">
                                        <Users className="h-6 w-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Unique Visitors
                                        </p>
                                        <p className="text-3xl font-bold">
                                            {shortCodeData.uniqueVisitors.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Device & Browser Stats - Side by Side on larger screens */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Device Stats Radar Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Monitor className="h-5 w-5" />
                                    Device Statistics
                                </CardTitle>
                                <CardDescription>
                                    Distribution of clicks by device type
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={deviceChartConfig}
                                    className="h-[300px] w-full"
                                >
                                    <RadarChart data={deviceData}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="device" tick={{ fontSize: 12 }} />
                                        <Radar
                                            dataKey="value"
                                            stroke="hsl(220, 70%, 50%)"
                                            fill="hsl(220, 70%, 50%)"
                                            fillOpacity={0.5}
                                        />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                    </RadarChart>
                                </ChartContainer>
                                <div className="flex flex-wrap justify-center gap-4 mt-4">
                                    <div className="flex items-center gap-2">
                                        <Monitor className="h-4 w-4" />
                                        <span className="text-sm">
                                            Desktop: {shortCodeData.deviceStats.desktop}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Smartphone className="h-4 w-4" />
                                        <span className="text-sm">
                                            Mobile: {shortCodeData.deviceStats.mobile}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Tablet className="h-4 w-4" />
                                        <span className="text-sm">
                                            Tablet: {shortCodeData.deviceStats.tablet}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <HelpCircle className="h-4 w-4" />
                                        <span className="text-sm">
                                            Others: {shortCodeData.deviceStats.others}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Browser Stats Radar Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="h-5 w-5" />
                                    Browser Statistics
                                </CardTitle>
                                <CardDescription>Distribution of clicks by browser</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={browserChartConfig}
                                    className="h-[300px] w-full"
                                >
                                    <RadarChart data={browserData}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="browser" tick={{ fontSize: 12 }} />
                                        <Radar
                                            dataKey="value"
                                            stroke="hsl(160, 60%, 45%)"
                                            fill="hsl(160, 60%, 45%)"
                                            fillOpacity={0.5}
                                        />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                    </RadarChart>
                                </ChartContainer>
                                <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
                                    <div>Chrome: {shortCodeData.browserStats.chrome}</div>
                                    <div>Firefox: {shortCodeData.browserStats.firefox}</div>
                                    <div>Safari: {shortCodeData.browserStats.safari}</div>
                                    <div>Edge: {shortCodeData.browserStats.edge}</div>
                                    <div>Opera: {shortCodeData.browserStats.opera}</div>
                                    <div>Others: {shortCodeData.browserStats.others}</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Daily Stats Line Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Daily Statistics
                            </CardTitle>
                            <CardDescription>Clicks and unique visitors over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {dailyData.length > 0 ? (
                                <ChartContainer
                                    config={dailyChartConfig}
                                    className="h-[350px] w-full"
                                >
                                    <LineChart
                                        data={dailyData}
                                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="totalClicks"
                                            name="Total Clicks"
                                            stroke="hsl(220, 70%, 50%)"
                                            strokeWidth={2}
                                            dot={{ r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="uniqueVisitors"
                                            name="Unique Visitors"
                                            stroke="hsl(160, 60%, 45%)"
                                            strokeWidth={2}
                                            dot={{ r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ChartContainer>
                            ) : (
                                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                                    No daily data available
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Hourly Stats Bar Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Hourly Statistics
                            </CardTitle>
                            <CardDescription>
                                Click distribution by hour of day (0-23)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={hourlyChartConfig} className="h-[300px] w-full">
                                <BarChart
                                    data={hourlyData}
                                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={1} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar
                                        dataKey="clicks"
                                        fill="hsl(220, 70%, 50%)"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Weekly Stats Bar Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Weekly Statistics
                            </CardTitle>
                            <CardDescription>Click distribution by day of week</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={weeklyChartConfig} className="h-[300px] w-full">
                                <BarChart
                                    data={weeklyData}
                                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar
                                        dataKey="clicks"
                                        fill="hsl(160, 60%, 45%)"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Location Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                Location Statistics
                            </CardTitle>
                            <CardDescription>
                                Clicks from {totalLocations} different location
                                {totalLocations !== 1 ? "s" : ""}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {locationData.length > 0 ? (
                                <ChartContainer
                                    config={locationChartConfig}
                                    className="h-[400px] w-full"
                                >
                                    <BarChart
                                        data={locationData}
                                        layout="vertical"
                                        margin={{ left: 100 }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            horizontal={true}
                                            vertical={false}
                                        />
                                        <XAxis type="number" />
                                        <YAxis
                                            type="category"
                                            dataKey="location"
                                            width={90}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar
                                            dataKey="clicks"
                                            fill="hsl(220, 70%, 50%)"
                                            radius={[0, 4, 4, 0]}
                                        />
                                    </BarChart>
                                </ChartContainer>
                            ) : (
                                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                                    No location data available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

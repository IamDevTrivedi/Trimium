"use client";

import * as React from "react";
import {
    BarChart3,
    MousePointerClick,
    Link2,
    Calendar,
    Clock,
    Globe,
    Search,
    ArrowUpDown,
    ExternalLink,
    Tag,
    Filter,
    Loader2,
    X,
    ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { backend } from "@/config/backend";
import { handleResponse } from "@/lib/handle-response";
import { toastError } from "@/lib/toast-error";
import { getTagById } from "@/lib/tags-getter";
import { DEFAULT_TAG } from "@/constants/tags";
import { cn } from "@/lib/utils";
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import { useParams, useRouter } from "next/navigation";

interface WorkspacePerformanceProps {
    totalURLS: number;
    totalActiveURLs: number;
    totalRedirections: number;
    totalLands: number;
    CTR: number;
    averageClicksPerLink: number;
    mostActiveDay: {
        totalClicks: number;
        day: string;
    };
    mostActiveHour: {
        totalClicks: number;
        hour: number;
    };
    totalUniqueLocations: number;
    topLinkByLocations: {
        location: string;
        count: number;
        percentage: number;
    }[];
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
    allURLsWithTitle: {
        title: string;
        isActive: boolean;
        _id: string;
        shortCode: string;
        totalClicks: number;
        lands: number;
        uniqueVisitors: number;
        tags: string[];
    }[];
}

export function WorkspacePerformance({
    workspacePerformance,
}: {
    workspacePerformance: WorkspacePerformanceProps;
}) {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [activeOnly, setActiveOnly] = React.useState(false);
    const [sortConfig, setSortConfig] = React.useState<{
        key: "title" | "shortCode" | "totalClicks" | "lands" | "uniqueVisitors";
        direction: "asc" | "desc";
    } | null>(null);

    // Tag filtering state
    const [workspaceTags, setWorkspaceTags] = React.useState<{ tag: string; tagID: number }[]>([]);
    const [selectedTags, setSelectedTags] = React.useState<Set<string>>(new Set());
    const [tagsLoading, setTagsLoading] = React.useState(false);
    const [isTagFilterOpen, setIsTagFilterOpen] = React.useState(false);

    const router = useRouter();
    const params = useParams();
    const { workspaceID } = params;

    // Fetch workspace tags when filter dropdown opens
    const fetchWorkspaceTags = React.useCallback(async () => {
        if (!workspaceID) return;
        try {
            setTagsLoading(true);
            const { data: resData } = await backend.post("/api/v1/workspace/get-tags", {
                workspaceID,
            });

            if (handleResponse(resData, true)) {
                setWorkspaceTags(resData.data || []);
            }
        } catch (error) {
            toastError(error);
        } finally {
            setTagsLoading(false);
        }
    }, [workspaceID]);

    // Fetch tags when popover opens
    React.useEffect(() => {
        if (isTagFilterOpen) {
            fetchWorkspaceTags();
        }
    }, [isTagFilterOpen, fetchWorkspaceTags]);

    const toggleTagSelection = (tagName: string) => {
        setSelectedTags((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(tagName)) {
                newSet.delete(tagName);
            } else {
                newSet.add(tagName);
            }
            return newSet;
        });
    };

    const clearTagFilters = () => {
        setSelectedTags(new Set());
    };

    const deviceData = [
        { device: "Desktop", value: workspacePerformance.deviceStats.desktop },
        { device: "Mobile", value: workspacePerformance.deviceStats.mobile },
        { device: "Tablet", value: workspacePerformance.deviceStats.tablet },
        { device: "Others", value: workspacePerformance.deviceStats.others },
    ];

    const browserData = [
        { browser: "Chrome", value: workspacePerformance.browserStats.chrome },
        { browser: "Firefox", value: workspacePerformance.browserStats.firefox },
        { browser: "Safari", value: workspacePerformance.browserStats.safari },
        { browser: "Edge", value: workspacePerformance.browserStats.edge },
        { browser: "Opera", value: workspacePerformance.browserStats.opera },
        { browser: "Others", value: workspacePerformance.browserStats.others },
    ];

    const chartConfig = {
        value: {
            label: "Value",
            color: "var(--chart-1)",
        },
    } satisfies ChartConfig;

    const deviceConfig = {
        value: {
            label: "Visitors",
            color: "#f59e0b",
        },
    } satisfies ChartConfig;

    const browserConfig = {
        value: {
            label: "Visitors",
            color: "#3b82f6",
        },
    } satisfies ChartConfig;

    const filteredAndSortedURLs = React.useMemo(() => {
        let result = workspacePerformance.allURLsWithTitle.filter((url) => {
            const matchesSearch =
                url.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                url.shortCode.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesActive = activeOnly ? url.isActive : true;
            // Tag filtering: if any tags are selected, URL must have at least one of them
            const matchesTags =
                selectedTags.size === 0 || url.tags.some((tag) => selectedTags.has(tag));
            return matchesSearch && matchesActive && matchesTags;
        });

        if (sortConfig) {
            result = [...result].sort((a, b) => {
                const key = sortConfig.key;
                const aValue = a[key];
                const bValue = b[key];

                if (typeof aValue === "string" && typeof bValue === "string") {
                    return sortConfig.direction === "asc"
                        ? aValue.localeCompare(bValue)
                        : bValue.localeCompare(aValue);
                }

                if (typeof aValue === "number" && typeof bValue === "number") {
                    return sortConfig.direction === "asc"
                        ? (aValue as number) - (bValue as number)
                        : (bValue as number) - (aValue as number);
                }

                return 0;
            });
        }

        return result;
    }, [workspacePerformance.allURLsWithTitle, searchQuery, activeOnly, sortConfig, selectedTags]);

    type SortKey = "title" | "shortCode" | "totalClicks" | "lands" | "uniqueVisitors";

    const toggleSort = (key: SortKey) => {
        setSortConfig((current) => {
            if (current?.key === key) {
                if (current.direction === "asc") return { key, direction: "desc" };
                return null;
            }
            return { key, direction: "asc" };
        });
    };

    const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
        if (sortConfig?.key !== columnKey)
            return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
        return sortConfig.direction === "asc" ? (
            <ArrowUpDown className="ml-2 h-4 w-4 text-primary" />
        ) : (
            <ArrowUpDown className="ml-2 h-4 w-4 text-primary rotate-180 transition-transform" />
        );
    };

    return (
        <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Workspace Performance</h1>
                <p className="text-muted-foreground">
                    Comprehensive analytics and management for your short links.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Link Inventory</CardTitle>
                        <Link2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{workspacePerformance.totalURLS}</div>
                        <p className="text-xs text-muted-foreground">
                            {workspacePerformance.totalActiveURLs} active links (
                            {Math.round(
                                (workspacePerformance.totalActiveURLs /
                                    workspacePerformance.totalURLS) *
                                    100
                            )}
                            %)
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Traffic Flow</CardTitle>
                        <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {workspacePerformance.totalRedirections.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {workspacePerformance.totalLands.toLocaleString()} landings across all
                            links
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {workspacePerformance.CTR.toFixed(2)}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {workspacePerformance.averageClicksPerLink.toFixed(1)} average clicks
                            per link
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> Peak Activity Day
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {workspacePerformance.mostActiveDay.day}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {workspacePerformance.mostActiveDay.totalClicks.toLocaleString()} total
                            clicks
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Clock className="h-4 w-4" /> Peak Activity Hour
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {String(workspacePerformance.mostActiveHour.hour).padStart(2, "0")}:00
                            to{" "}
                            {String((workspacePerformance.mostActiveHour.hour + 1) % 24).padStart(
                                2,
                                "0"
                            )}
                            :00
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {workspacePerformance.mostActiveHour.totalClicks.toLocaleString()} total
                            clicks
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Globe className="h-4 w-4" /> Geographic Reach
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {workspacePerformance.totalUniqueLocations}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Unique geographic regions tracked
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Activity and Location */}
            {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

            </div> */}

            {/* Radar Charts & Geographic reach */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Device Distribution (in %)</CardTitle>
                        <CardDescription>Audience breakdown by hardware platform.</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-6">
                        <ChartContainer
                            config={deviceConfig}
                            className="mx-auto aspect-square h-[300px] w-full"
                        >
                            <RadarChart data={deviceData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="device" tick={{ fontSize: 12 }} />
                                <Radar
                                    dataKey="value"
                                    stroke="hsl(30, 80%, 55%)"
                                    fill="hsl(30, 80%, 55%)"
                                    fillOpacity={0.5}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} />
                            </RadarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Browser Preference (in %)</CardTitle>
                        <CardDescription>Audience breakdown by software choice.</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-6">
                        <ChartContainer
                            config={browserConfig}
                            className="mx-auto aspect-square h-[300px] w-full"
                        >
                            <RadarChart data={browserData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="browser" tick={{ fontSize: 12 }} />
                                <Radar
                                    dataKey="value"
                                    stroke="hsl(220, 70%, 50%)"
                                    fill="hsl(220, 70%, 50%)"
                                    fillOpacity={0.5}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} />
                            </RadarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* URL Management Table */}
            <Card className="shadow-sm border-none bg-muted/30">
                <CardHeader className="px-6">
                    <div className="flex flex-col gap-4">
                        <div>
                            <CardTitle className="text-lg font-semibold">URL Inventory</CardTitle>
                            <CardDescription>
                                Manage and monitor all short links in your workspace.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Tag Filter Dropdown */}
                            <Popover open={isTagFilterOpen} onOpenChange={setIsTagFilterOpen}>
                                <PopoverTrigger>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={cn(
                                            "h-9 gap-2",
                                            selectedTags.size > 0 && "border-primary"
                                        )}
                                    >
                                        <Filter className="h-4 w-4 mr-2" />
                                        Tags
                                        {selectedTags.size > 0 && (
                                            <Badge
                                                variant="secondary"
                                                className="ml-1 h-5 px-1.5 text-xs"
                                            >
                                                {selectedTags.size}
                                            </Badge>
                                        )}
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[250px] p-0" align="end">
                                    <div className="p-3 border-b">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                                <Tag className="h-4 w-4" />
                                                Filter by Tags
                                            </h4>
                                            {selectedTags.size > 0 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 px-2 text-xs"
                                                    onClick={clearTagFilters}
                                                >
                                                    Clear
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <ScrollArea className="max-h-[250px]">
                                        {tagsLoading ? (
                                            <div className="flex items-center justify-center py-6">
                                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                            </div>
                                        ) : workspaceTags.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                                <Tag className="h-8 w-8 text-muted-foreground/50 mb-2" />
                                                <p className="text-sm text-muted-foreground">
                                                    No tags in workspace
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="p-2 space-y-1">
                                                {workspaceTags.map((tagData) => {
                                                    const tagStyle =
                                                        getTagById(tagData.tagID) || DEFAULT_TAG;
                                                    const isSelected = selectedTags.has(
                                                        tagData.tag
                                                    );
                                                    return (
                                                        <div
                                                            key={tagData.tag}
                                                            className={cn(
                                                                "flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors",
                                                                isSelected
                                                                    ? "bg-primary/10"
                                                                    : "hover:bg-muted"
                                                            )}
                                                            onClick={() =>
                                                                toggleTagSelection(tagData.tag)
                                                            }
                                                        >
                                                            <Checkbox
                                                                checked={isSelected}
                                                                onCheckedChange={() =>
                                                                    toggleTagSelection(tagData.tag)
                                                                }
                                                            />
                                                            <Badge
                                                                className={cn(
                                                                    tagStyle.bg,
                                                                    tagStyle.text,
                                                                    "font-medium"
                                                                )}
                                                            >
                                                                {tagData.tag}
                                                            </Badge>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </ScrollArea>
                                </PopoverContent>
                            </Popover>

                            <div className="flex items-center space-x-2 mr-2">
                                <Switch
                                    id="active-toggle"
                                    checked={activeOnly}
                                    onCheckedChange={setActiveOnly}
                                />
                                <label
                                    htmlFor="active-toggle"
                                    className="text-sm font-medium leading-none cursor-pointer"
                                >
                                    Active Only
                                </label>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search title or code..."
                                    className="pl-9 w-[200px] lg:w-[300px] h-9 bg-background"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Selected Tags Display */}
                    {selectedTags.size > 0 && (
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                            <span className="text-xs text-muted-foreground">Filtering by:</span>
                            {Array.from(selectedTags).map((tagName) => {
                                const tagData = workspaceTags.find((t) => t.tag === tagName);
                                const tagStyle = tagData
                                    ? getTagById(tagData.tagID) || DEFAULT_TAG
                                    : DEFAULT_TAG;
                                return (
                                    <Badge
                                        key={tagName}
                                        className={cn(
                                            tagStyle.bg,
                                            tagStyle.text,
                                            "font-medium pr-1 flex items-center gap-1"
                                        )}
                                    >
                                        {tagName}
                                        <button
                                            className="ml-1 p-0.5 rounded-full hover:bg-black/20 transition-colors"
                                            onClick={() => toggleTagSelection(tagName)}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                );
                            })}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs text-muted-foreground"
                                onClick={clearTagFilters}
                            >
                                Clear all
                            </Button>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="px-6 py-0 border-t">
                    <Table>
                        <TableHeader className="">
                            <TableRow>
                                <TableHead className="w-[300px]">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="-ml-3 h-8 font-bold"
                                        onClick={() => toggleSort("title")}
                                    >
                                        Link Title <SortIcon columnKey="title" />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="-ml-3 h-8 font-bold"
                                        onClick={() => toggleSort("shortCode")}
                                    >
                                        Short Code <SortIcon columnKey="shortCode" />
                                    </Button>
                                </TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Tags</TableHead>
                                <TableHead className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="-ml-3 h-8 font-bold"
                                        onClick={() => toggleSort("totalClicks")}
                                    >
                                        Redirects <SortIcon columnKey="totalClicks" />
                                    </Button>
                                </TableHead>
                                <TableHead className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="-ml-3 h-8 font-bold"
                                        onClick={() => toggleSort("lands")}
                                    >
                                        Lands <SortIcon columnKey="lands" />
                                    </Button>
                                </TableHead>
                                <TableHead className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="-ml-3 h-8 font-bold"
                                        onClick={() => toggleSort("uniqueVisitors")}
                                    >
                                        Uniques <SortIcon columnKey="uniqueVisitors" />
                                    </Button>
                                </TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="bg-background">
                            {filteredAndSortedURLs.length > 0 ? (
                                filteredAndSortedURLs.map((url) => (
                                    <TableRow
                                        key={url._id}
                                        className="hover:bg-muted/50 transition-colors"
                                    >
                                        <TableCell className="font-medium py-3">
                                            <div className="flex flex-col max-w-[280px]">
                                                <span className="truncate">{url.title}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <code className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono border border-border">
                                                {url.shortCode}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            {url.isActive ? (
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-none font-medium h-5"
                                                >
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    variant="outline"
                                                    className="text-muted-foreground h-5"
                                                >
                                                    Inactive
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                {url.tags.length > 0 ? (
                                                    url.tags.slice(0, 3).map((tagName) => {
                                                        const tagData = workspaceTags.find(
                                                            (t) => t.tag === tagName
                                                        );
                                                        const tagStyle = tagData
                                                            ? getTagById(tagData.tagID) ||
                                                              DEFAULT_TAG
                                                            : DEFAULT_TAG;
                                                        return (
                                                            <Badge
                                                                key={tagName}
                                                                className={cn(
                                                                    tagStyle.bg,
                                                                    tagStyle.text,
                                                                    "font-medium text-[10px] h-5 px-1.5"
                                                                )}
                                                            >
                                                                {tagName}
                                                            </Badge>
                                                        );
                                                    })
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                                {url.tags.length > 3 && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[10px] h-5 px-1.5"
                                                    >
                                                        +{url.tags.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {url.totalClicks.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">
                                            {url.lands.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">
                                            {url.uniqueVisitors.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                onClick={() =>
                                                    router.push(
                                                        `/w/${workspaceID}/${url.shortCode}`
                                                    )
                                                }
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="h-32 text-center text-muted-foreground"
                                    >
                                        No links found matching your search.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

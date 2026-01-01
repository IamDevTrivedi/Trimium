"use client";

import React from "react";
import { backend } from "@/config/backend";
import { handleResponse } from "@/lib/handle-response";
import { toastError } from "@/lib/toast-error";
import { Toast } from "@/components/toast";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import { Plus, Trash2, Tag, Loader2, X } from "lucide-react";
import { getTagById, DEFAULT_TAG } from "@/constants/tags";
import { cn } from "@/lib/utils";

interface WorkspaceTag {
    tag: string;
    tagID: number;
}

interface ShortcodeTagsProps {
    shortCode: string;
    workspaceID: string;
    permission: "admin" | "member" | "viewer";
    initialTags?: WorkspaceTag[];
}

export function ShortcodeTags({
    shortCode,
    workspaceID,
    permission,
    initialTags = [],
}: ShortcodeTagsProps) {
    const [shortcodeTags, setShortcodeTags] = React.useState<WorkspaceTag[]>(initialTags);
    const [workspaceTags, setWorkspaceTags] = React.useState<WorkspaceTag[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = React.useState<boolean>(false);
    const [addLoading, setAddLoading] = React.useState<string | null>(null);
    const [removeLoading, setRemoveLoading] = React.useState<string | null>(null);

    const canEdit = permission === "admin" || permission === "member";

    const fetchTags = React.useCallback(async () => {
        try {
            setLoading(true);
            // Fetch shortcode tags
            const { data: shortcodeRes } = await backend.post("/api/v1/workspace/get-tags", {
                shortCode,
            });

            // Fetch workspace tags
            const { data: workspaceRes } = await backend.post("/api/v1/workspace/get-tags", {
                workspaceID,
            });

            if (handleResponse(shortcodeRes, true)) {
                setShortcodeTags(shortcodeRes.data || []);
            }

            if (handleResponse(workspaceRes, true)) {
                setWorkspaceTags(workspaceRes.data || []);
            }
        } catch (error) {
            toastError(error);
        } finally {
            setLoading(false);
        }
    }, [shortCode, workspaceID]);

    React.useEffect(() => {
        fetchTags();
    }, [fetchTags]);

    // Get available tags (workspace tags not already on shortcode)
    const availableTags = React.useMemo(() => {
        const shortcodeTagNames = new Set(shortcodeTags.map((t) => t.tag));
        return workspaceTags.filter((t) => !shortcodeTagNames.has(t.tag));
    }, [shortcodeTags, workspaceTags]);

    const handleAddTag = async (tagName: string) => {
        try {
            setAddLoading(tagName);
            const { data: resData } = await backend.post("/api/v1/workspace/set-tags-to-shortcode", {
                shortCode,
                tagsToAdd: [tagName],
            });

            if (handleResponse(resData)) {
                Toast.success(`Tag "${tagName}" added successfully`);
                const addedTag = workspaceTags.find((t) => t.tag === tagName);
                if (addedTag) {
                    setShortcodeTags((prev) => [...prev, addedTag]);
                }
            }
        } catch (error) {
            toastError(error);
        } finally {
            setAddLoading(null);
        }
    };

    const handleRemoveTag = async (tagName: string) => {
        try {
            setRemoveLoading(tagName);
            const { data: resData } = await backend.post("/api/v1/workspace/set-tags-to-shortcode", {
                shortCode,
                tagsToRemove: [tagName],
            });

            if (handleResponse(resData)) {
                Toast.success(`Tag "${tagName}" removed successfully`);
                setShortcodeTags((prev) => prev.filter((t) => t.tag !== tagName));
            }
        } catch (error) {
            toastError(error);
        } finally {
            setRemoveLoading(null);
        }
    };

    const renderTagBadge = (tagData: WorkspaceTag, showRemove: boolean = false) => {
        const tagStyle = getTagById(tagData.tagID) || DEFAULT_TAG;
        const isRemoving = removeLoading === tagData.tag;

        return (
            <Badge
                key={tagData.tag}
                className={cn(
                    tagStyle.bg,
                    tagStyle.text,
                    "font-medium pr-1 flex items-center gap-1",
                    isRemoving && "opacity-50"
                )}
            >
                {tagData.tag}
                {showRemove && canEdit && (
                    <AlertDialog>
                        <AlertDialogTrigger>
                            <button
                                className="ml-1 p-0.5 rounded-full hover:bg-black/20 transition-colors"
                                disabled={isRemoving}
                            >
                                {isRemoving ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <X className="h-3 w-3" />
                                )}
                            </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Remove this tag?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will remove the tag "{tagData.tag}" from this short link.
                                    The tag will still be available in the workspace.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => handleRemoveTag(tagData.tag)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Remove Tag
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </Badge>
        );
    };

    return (
        <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/5 pb-4">
                <div className="space-y-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Tag className="h-5 w-5" />
                        Link Tags
                    </CardTitle>
                    <CardDescription>
                        {canEdit
                            ? "Add or remove tags to organize this short link."
                            : "Tags associated with this short link."}
                    </CardDescription>
                </div>
                {canEdit && availableTags.length > 0 && (
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger>
                            <Button size="sm" className="h-8 shadow-sm">
                                <Plus className="mr-2 h-4 w-4" /> Add Tag
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Add Tags</DialogTitle>
                                <DialogDescription>
                                    Select tags from your workspace to add to this short link.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <ScrollArea className={availableTags.length > 8 ? "h-[300px]" : "h-auto"}>
                                    <div className="grid gap-2">
                                        {availableTags.map((tagData) => {
                                            const tagStyle = getTagById(tagData.tagID) || DEFAULT_TAG;
                                            const isAdding = addLoading === tagData.tag;

                                            return (
                                                <div
                                                    key={tagData.tag}
                                                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={cn(
                                                                "w-4 h-4 rounded",
                                                                tagStyle.bg
                                                            )}
                                                        />
                                                        <span className="font-medium">
                                                            {tagData.tag}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            ({tagStyle.displayName})
                                                        </span>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleAddTag(tagData.tag)}
                                                        disabled={isAdding || addLoading !== null}
                                                    >
                                                        {isAdding ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Plus className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </ScrollArea>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsAddDialogOpen(false)}
                                >
                                    Close
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </CardHeader>
            <CardContent className="p-6">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : shortcodeTags.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Tag className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground">No tags assigned</p>
                        {canEdit && workspaceTags.length > 0 && (
                            <p className="text-sm text-muted-foreground mt-1">
                                Click "Add Tag" to assign tags to this short link.
                            </p>
                        )}
                        {canEdit && workspaceTags.length === 0 && (
                            <p className="text-sm text-muted-foreground mt-1">
                                Create tags in your workspace settings first.
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {shortcodeTags.map((tagData) => renderTagBadge(tagData, true))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Pencil, Tag, Loader2 } from "lucide-react";
import { TAGS, DEFAULT_TAG, ITAG } from "@/constants/tags";
import { getTagById } from "@/lib/tags-getter";
import { cn } from "@/lib/utils";

interface WorkspaceTag {
    tag: string;
    tagID: number;
}

interface WorkspaceTagsProps {
    workspaceID: string;
    isAdmin: boolean;
    permission: "admin" | "member" | "viewer";
}

export function WorkspaceTags({ workspaceID, isAdmin, permission }: WorkspaceTagsProps) {
    const [tags, setTags] = React.useState<WorkspaceTag[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState<boolean>(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState<boolean>(false);
    const [createLoading, setCreateLoading] = React.useState<boolean>(false);
    const [editLoading, setEditLoading] = React.useState<boolean>(false);
    const [deleteLoading, setDeleteLoading] = React.useState<string | null>(null);

    // Create form state
    const [newTagName, setNewTagName] = React.useState<string>("");
    const [newTagColorID, setNewTagColorID] = React.useState<number>(DEFAULT_TAG.id);
    const [createError, setCreateError] = React.useState<string | null>(null);

    // Edit form state
    const [editingTag, setEditingTag] = React.useState<WorkspaceTag | null>(null);
    const [editTagName, setEditTagName] = React.useState<string>("");
    const [editTagColorID, setEditTagColorID] = React.useState<number>(DEFAULT_TAG.id);
    const [editError, setEditError] = React.useState<string | null>(null);

    const canEdit = permission === "admin" || permission === "member";

    const fetchTags = React.useCallback(async () => {
        try {
            setLoading(true);
            const { data: resData } = await backend.post("/api/v1/workspace/get-tags", {
                workspaceID,
            });

            if (handleResponse(resData, true)) {
                setTags(resData.data || []);
            }
        } catch (error) {
            toastError(error);
        } finally {
            setLoading(false);
        }
    }, [workspaceID]);

    React.useEffect(() => {
        fetchTags();
    }, [fetchTags]);

    const handleCreateTag = async () => {
        if (!newTagName.trim()) {
            setCreateError("Tag name is required");
            return;
        }

        const tagRegex = /^(?=.{1,32}$)(?!-)(?!.*--)[a-z0-9]+(?:-[a-z0-9]+)*$/;
        if (!tagRegex.test(newTagName)) {
            setCreateError(
                "Tag must be 1-32 characters, lowercase letters, numbers, and single hyphens (not at start/end)"
            );
            return;
        }

        try {
            setCreateLoading(true);
            const { data: resData } = await backend.post("/api/v1/workspace/create-tag", {
                workspaceID,
                tag: newTagName,
                tagID: newTagColorID,
            });

            if (handleResponse(resData)) {
                Toast.success("Tag created successfully");
                setTags((prev) => [...prev, { tag: newTagName, tagID: newTagColorID }]);
                setIsCreateDialogOpen(false);
                setNewTagName("");
                setNewTagColorID(DEFAULT_TAG.id);
                setCreateError(null);
            }
        } catch (error) {
            toastError(error);
        } finally {
            setCreateLoading(false);
        }
    };

    const handleOpenEditDialog = (tagData: WorkspaceTag) => {
        setEditingTag(tagData);
        setEditTagName(tagData.tag);
        setEditTagColorID(tagData.tagID);
        setEditError(null);
        setIsEditDialogOpen(true);
    };

    const handleUpdateTag = async () => {
        if (!editingTag) return;

        const tagRegex = /^(?=.{1,32}$)(?!-)(?!.*--)[a-z0-9]+(?:-[a-z0-9]+)*$/;
        if (editTagName && !tagRegex.test(editTagName)) {
            setEditError(
                "Tag must be 1-32 characters, lowercase letters, numbers, and single hyphens (not at start/end)"
            );
            return;
        }

        const hasNameChange = editTagName !== editingTag.tag;
        const hasColorChange = editTagColorID !== editingTag.tagID;

        if (!hasNameChange && !hasColorChange) {
            setIsEditDialogOpen(false);
            return;
        }

        try {
            setEditLoading(true);
            const { data: resData } = await backend.post("/api/v1/workspace/update-tag", {
                workspaceID,
                oldTag: editingTag.tag,
                ...(hasNameChange && { newTag: editTagName }),
                ...(hasColorChange && { newTagID: editTagColorID }),
            });

            if (handleResponse(resData)) {
                Toast.success("Tag updated successfully");
                setTags((prev) =>
                    prev.map((t) =>
                        t.tag === editingTag.tag
                            ? { tag: hasNameChange ? editTagName : t.tag, tagID: editTagColorID }
                            : t
                    )
                );
                setIsEditDialogOpen(false);
                setEditingTag(null);
                setEditError(null);
            }
        } catch (error) {
            toastError(error);
        } finally {
            setEditLoading(false);
        }
    };

    const handleDeleteTag = async (tagName: string) => {
        try {
            setDeleteLoading(tagName);
            const { data: resData } = await backend.post("/api/v1/workspace/delete-tag", {
                workspaceID,
                tag: tagName,
            });

            if (handleResponse(resData)) {
                Toast.success("Tag deleted successfully");
                setTags((prev) => prev.filter((t) => t.tag !== tagName));
            }
        } catch (error) {
            toastError(error);
        } finally {
            setDeleteLoading(null);
        }
    };

    const renderTagPreview = (tagID: number, tagName: string) => {
        const tagStyle = getTagById(tagID) || DEFAULT_TAG;
        return (
            <Badge className={cn(tagStyle.bg, tagStyle.text, "font-medium")}>
                {tagName}
            </Badge>
        );
    };

    const renderColorSelector = (
        value: number,
        onChange: (val: number) => void,
        id: string
    ) => (
        <Select
            value={value.toString()}
            onValueChange={(val) => val && onChange(parseInt(val))}
        >
            <SelectTrigger id={id} className="bg-muted/30">
                <SelectValue>
                    {(() => {
                        const tag = getTagById(value) || DEFAULT_TAG;
                        return (
                            <div className="flex items-center gap-2">
                                <div className={cn("w-4 h-4 rounded", tag.bg)} />
                                <span>{tag.displayName}</span>
                            </div>
                        );
                    })()}
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                <ScrollArea className="h-[200px]">
                    {TAGS.map((tagOption: ITAG) => (
                        <SelectItem key={tagOption.id} value={tagOption.id.toString()}>
                            <div className="flex items-center gap-2">
                                <div className={cn("w-4 h-4 rounded", tagOption.bg)} />
                                <span>{tagOption.displayName}</span>
                            </div>
                        </SelectItem>
                    ))}
                </ScrollArea>
            </SelectContent>
        </Select>
    );

    return (
        <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/5 pb-4">
                <div className="space-y-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Tag className="h-5 w-5" />
                        Workspace Tags
                    </CardTitle>
                    <CardDescription>
                        {canEdit
                            ? "Manage tags for organizing your short links."
                            : "View tags used in this workspace."}
                    </CardDescription>
                </div>
                {canEdit && (
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger>
                            <Button size="sm" className="h-8 shadow-sm">
                                <Plus className="mr-2 h-4 w-4" /> New Tag
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Create New Tag</DialogTitle>
                                <DialogDescription>
                                    Add a new tag to organize your short links.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tagName">Tag Name</Label>
                                    <Input
                                        id="tagName"
                                        placeholder="e.g., marketing, social-media"
                                        value={newTagName}
                                        onChange={(e) => {
                                            setNewTagName(e.target.value.toLowerCase());
                                            setCreateError(null);
                                        }}
                                        className="bg-muted/30"
                                    />
                                    {createError && (
                                        <p className="text-sm text-destructive">{createError}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tagColor">Tag Color</Label>
                                    {renderColorSelector(newTagColorID, setNewTagColorID, "tagColor")}
                                </div>
                                {newTagName && (
                                    <div className="space-y-2">
                                        <Label>Preview</Label>
                                        <div className="p-3 bg-muted/20 rounded-lg">
                                            {renderTagPreview(newTagColorID, newTagName)}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsCreateDialogOpen(false);
                                        setNewTagName("");
                                        setNewTagColorID(DEFAULT_TAG.id);
                                        setCreateError(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreateTag}
                                    disabled={!newTagName || createLoading}
                                >
                                    {createLoading && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Create Tag
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </CardHeader>
            <CardContent className="p-0">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : tags.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Tag className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground">No tags yet</p>
                        {canEdit && (
                            <p className="text-sm text-muted-foreground mt-1">
                                Create your first tag to start organizing links.
                            </p>
                        )}
                    </div>
                ) : (
                    <ScrollArea className={tags.length > 5 ? "h-[350px]" : "h-auto"}>
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="py-4 pl-6">Tag</TableHead>
                                    <TableHead className="py-4">Color Theme</TableHead>
                                    {canEdit && (
                                        <TableHead className="py-4 pr-6 text-right">
                                            Actions
                                        </TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tags.map((tagData) => {
                                    const tagStyle = getTagById(tagData.tagID) || DEFAULT_TAG;
                                    return (
                                        <TableRow
                                            key={tagData.tag}
                                            className="group border-border/40 transition-colors"
                                        >
                                            <TableCell className="py-4 pl-6">
                                                {renderTagPreview(tagData.tagID, tagData.tag)}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={cn(
                                                            "w-4 h-4 rounded",
                                                            tagStyle.bg
                                                        )}
                                                    />
                                                    <span className="text-sm text-muted-foreground">
                                                        {tagStyle.displayName}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            {canEdit && (
                                                <TableCell className="py-4 pr-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                            onClick={() =>
                                                                handleOpenEditDialog(tagData)
                                                            }
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon-sm"
                                                                    className="h-8 w-8 text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
                                                                    disabled={
                                                                        deleteLoading === tagData.tag
                                                                    }
                                                                >
                                                                    {deleteLoading === tagData.tag ? (
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                    ) : (
                                                                        <Trash2 className="h-4 w-4" />
                                                                    )}
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>
                                                                        Delete this tag?
                                                                    </AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This will remove the tag "
                                                                        {tagData.tag}" from this
                                                                        workspace and all associated
                                                                        short links.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>
                                                                        Cancel
                                                                    </AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() =>
                                                                            handleDeleteTag(
                                                                                tagData.tag
                                                                            )
                                                                        }
                                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                    >
                                                                        Delete Tag
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                )}
            </CardContent>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Tag</DialogTitle>
                        <DialogDescription>
                            Update the tag name or color theme.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="editTagName">Tag Name</Label>
                            <Input
                                id="editTagName"
                                placeholder="e.g., marketing, social-media"
                                value={editTagName}
                                onChange={(e) => {
                                    setEditTagName(e.target.value.toLowerCase());
                                    setEditError(null);
                                }}
                                className="bg-muted/30"
                            />
                            {editError && (
                                <p className="text-sm text-destructive">{editError}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editTagColor">Tag Color</Label>
                            {renderColorSelector(editTagColorID, setEditTagColorID, "editTagColor")}
                        </div>
                        {editTagName && (
                            <div className="space-y-2">
                                <Label>Preview</Label>
                                <div className="p-3 bg-muted/20 rounded-lg">
                                    {renderTagPreview(editTagColorID, editTagName)}
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditDialogOpen(false);
                                setEditingTag(null);
                                setEditError(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateTag} disabled={!editTagName || editLoading}>
                            {editLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}

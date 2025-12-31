"use client";

import { backend } from "@/config/backend";
import { handleResponse } from "@/lib/handle-response";
import { toastError } from "@/lib/toast-error";
import { useUserStore } from "@/store/user-store";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
    Plus,
    Trash2,
    LogOut,
    Shield,
    Save,
    Loader2,
    Calendar,
    CheckCircle2Icon,
    Info,
    FileSpreadsheet,
} from "lucide-react";
import { format } from "date-fns";
import { LoadingPage } from "@/components/loading";
import { EMAIL } from "@/constants/regex";
import { WorkspacePerformance } from "./workspace-performance";
import { Separator } from "./ui/separator";
import TopBackButton from "./top-back-button";

interface workspaceData {
    _id: string;
    title: string;
    description: string;
    createdAt: string;
    members: {
        userID: string;
        permission: "admin" | "member" | "viewer";
        fullName: string;
        email: string;
        username: string;
    }[];
}

export function WorkspaceDetails() {
    const { workspaceID } = useParams<{ workspaceID: string }>();
    const [workspaceData, setWorkspaceData] = React.useState<workspaceData | null>(null);
    const [workspacePerformance, setWorkspacePerformance] = React.useState<any>(null);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [isSaving, setIsSaving] = React.useState<boolean>(false);
    const { user } = useUserStore();
    const myUserID = user?._id;
    const router = useRouter();
    const [isAdmin, setIsAdmin] = React.useState<boolean>(false);
    const [permission, setPermission] = React.useState<"admin" | "member" | "viewer">("viewer");

    const [members, setMembers] = React.useState<workspaceData["members"]>([]);
    const [originalMembers, setOriginalMembers] = React.useState<workspaceData["members"]>([]);
    const [inviteEmail, setInviteEmail] = React.useState<string>("");
    const [invitePermission, setInvitePermission] = React.useState<"admin" | "member" | "viewer">(
        "member"
    );
    const [isInviteDialogOpen, setIsInviteDialogOpen] = React.useState<boolean>(false);
    const [inviteError, setInviteError] = React.useState<string | null>(null);
    const [inviteLoading, setInviteLoading] = React.useState<boolean>(false);

    const [hasChanges, setHasChanges] = React.useState<boolean>(false);

    React.useEffect(() => {
        const changesExist = JSON.stringify(members) !== JSON.stringify(originalMembers);
        setHasChanges(changesExist);
    }, [members, originalMembers]);

    React.useEffect(() => {
        const fetcher = async () => {
            try {
                setLoading(true);
                const { data: resData } = await backend.post(
                    "/api/v1/workspace/get-workspace-details",
                    {
                        workspaceID,
                    }
                );

                if (handleResponse(resData, true)) {
                    setWorkspaceData(resData.workspaceDetails);
                    setWorkspacePerformance(resData.workspacePerformance);
                    setMembers(resData.workspaceDetails.members);
                    setOriginalMembers(resData.workspaceDetails.members);

                    const currentUser = resData.workspaceDetails.members.find(
                        (member: any) => member.userID === myUserID
                    );
                    if (currentUser && currentUser.permission === "admin") {
                        setIsAdmin(true);
                    }
                    if (currentUser) {
                        setPermission(currentUser.permission);
                    } else {
                        router.push("/w");
                    }
                } else {
                    router.push("/w");
                }
            } catch (error) {
                router.push("/w");
                toastError(error);
            } finally {
                setLoading(false);
            }
        };
        fetcher();
    }, [workspaceID, myUserID, router]);

    const handlePermissionChange = (
        userID: string,
        newPermission: "admin" | "member" | "viewer"
    ) => {
        setMembers((prev) =>
            prev.map((m) => (m.userID === userID ? { ...m, permission: newPermission } : m))
        );
    };

    const handleRemoveMember = (userID: string) => {
        setMembers((prev) => prev.filter((m) => m.userID !== userID));
    };

    const handleSaveChanges = async () => {
        try {
            setIsSaving(true);

            const membersToUpdate: {
                memberID: string;
                permission: "admin" | "member" | "viewer";
            }[] = [];

            const membersToRemove: string[] = [];

            members.forEach((member) => {
                const originalMember = originalMembers.find((m) => m.userID === member.userID);
                if (originalMember && originalMember.permission !== member.permission) {
                    membersToUpdate.push({
                        memberID: member.userID,
                        permission: member.permission,
                    });
                }
            });

            originalMembers.forEach((originalMember) => {
                const stillExists = members.find((m) => m.userID === originalMember.userID);
                if (!stillExists) {
                    membersToRemove.push(originalMember.userID);
                }
            });

            const { data: resData } = await backend.post(
                "/api/v1/workspace/sudo-update-workspace",
                {
                    workspaceID: workspaceID,
                    membersToUpdate,
                    membersToRemove,
                }
            );

            if (handleResponse(resData)) {
                setOriginalMembers(members);
                setHasChanges(false);
            }
        } catch (error) {
            toastError(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleLeaveWorkspace = async () => {
        try {
            const { data: resData } = await backend.post("/api/v1/workspace/leave-workspace", {
                workspaceID: workspaceID,
            });

            if (handleResponse(resData)) {
                router.push("/w");
            }
        } catch (error) {
            toastError(error);
        }
    };

    const handleDeleteWorkspace = async () => {
        try {
            const { data: resData } = await backend.post(
                "/api/v1/workspace/sudo-update-workspace",
                {
                    workspaceID: workspaceID,
                    deleteWorkspace: true,
                }
            );

            if (handleResponse(resData)) {
                router.push("/w");
            }
        } catch (error) {
            toastError(error);
        }
    };

    const handleInvite = async () => {
        if (EMAIL.test(inviteEmail) === false) {
            setInviteError("Please enter a valid email address.");
            return;
        }

        try {
            setInviteLoading(true);
            const { data: resData } = await backend.post(
                "/api/v1/workspace/sudo-update-workspace",
                {
                    workspaceID: workspaceID,
                    membersToAdd: [
                        {
                            email: inviteEmail,
                            permission: invitePermission,
                        },
                    ],
                }
            );
            handleResponse(resData);
        } catch (error) {
            toastError(error);
        } finally {
            setInviteLoading(false);
            setIsInviteDialogOpen(false);
            setInviteEmail("");
        }
    };

    if (loading) {
        return <LoadingPage />;
    }

    if (!workspaceData) return null;

    return (
        <div className="space-y-4 w-full max-w-5xl mx-auto">
            <div>
                <TopBackButton />
            </div>

            {/* Header Section */}
            <div className="space-y-3 w-full mx-auto text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center justify-between">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                        {workspaceData.title}
                    </h1>
                    <Badge
                        variant="outline"
                        className="px-2 py-1 font-mono text-[10px] uppercase tracking-wider opacity-60"
                    >
                        ID: {workspaceID}
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{workspaceData.description}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Created on {format(new Date(workspaceData.createdAt), "PPP")}</span>
                </div>
            </div>

            <Alert
                className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
                variant={"default"}
            >
                <Info />
                <AlertTitle className="text-blue-800 dark:text-blue-200">
                    You have Joined this workspace as <strong>{permission}</strong>
                </AlertTitle>
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                    {`${permission === "admin" ? "You have full access to manage members and project." : ""}`}
                    {`${permission === "member" ? "You can view and manage project but cannot change workspace settings." : ""}`}
                    {`${permission === "viewer" ? "You can only view projects in this workspace." : ""}`}
                </AlertDescription>
            </Alert>

            <div className="grid gap-8">
                {/* Members Management Section */}
                <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/5 pb-4">
                        <div className="space-y-1">
                            <CardTitle className="text-xl">Workspace Members</CardTitle>
                            <CardDescription>
                                {isAdmin
                                    ? "Manage workspace members and their roles."
                                    : "View workspace members and their roles."}
                            </CardDescription>
                        </div>
                        {isAdmin && (
                            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                                <DialogTrigger>
                                    <Button size="sm" className="h-8 shadow-sm">
                                        <Plus className="mr-2 h-4 w-4" /> Add Member
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Invite new member</DialogTitle>
                                        <DialogDescription>
                                            Add a team member to this workspace by email.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="user@example.com"
                                                value={inviteEmail}
                                                onChange={(e) => {
                                                    setInviteEmail(e.target.value);
                                                    setInviteError(null);
                                                }}
                                                className="bg-muted/30"
                                            />
                                            {inviteError && (
                                                <p className="text-sm text-destructive">
                                                    {inviteError}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="role">Role</Label>
                                            <Select
                                                value={invitePermission}
                                                onValueChange={(val) => setInvitePermission(val!)}
                                            >
                                                <SelectTrigger id="role" className="bg-muted/30">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="member">Member</SelectItem>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                    <SelectItem value="viewer">Viewer</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsInviteDialogOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleInvite}
                                            disabled={!inviteEmail}
                                            loading={inviteLoading}
                                        >
                                            Send Invite
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className={members.length > 5 ? "h-[400px]" : "h-auto"}>
                            <Table>
                                <TableHeader className="    ">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="py-4 pl-6">Member</TableHead>
                                        <TableHead className="py-4">Role</TableHead>
                                        {isAdmin && (
                                            <TableHead className="py-4 pr-6 text-right">
                                                Actions
                                            </TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {members.map((member) => (
                                        <TableRow
                                            key={member.userID}
                                            className="group border-border/40 transition-colors"
                                        >
                                            <TableCell className="py-4 pl-6">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-semibold text-foreground">
                                                        {member.fullName}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {member.email}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {isAdmin && member.userID !== myUserID ? (
                                                    <Select
                                                        value={member.permission}
                                                        onValueChange={(val) =>
                                                            handlePermissionChange(
                                                                member.userID,
                                                                val!
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger className="h-8 w-[120px] bg-muted/20 text-xs font-medium">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="member">
                                                                Member
                                                            </SelectItem>
                                                            <SelectItem value="admin">
                                                                Admin
                                                            </SelectItem>
                                                            <SelectItem value="viewer">
                                                                Viewer
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <div className="flex items-center gap-1.5">
                                                        <Badge
                                                            variant={
                                                                member.permission === "admin"
                                                                    ? "default"
                                                                    : "secondary"
                                                            }
                                                            className="uppercase"
                                                        >
                                                            {member.permission === "admin" && (
                                                                <Shield className="mr-1 h-3 w-3" />
                                                            )}
                                                            {member.permission}
                                                        </Badge>
                                                        {member.userID === myUserID && (
                                                            <span className="italic text-muted-foreground">
                                                                (You)
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </TableCell>
                                            {isAdmin && (
                                                <TableCell className="py-4 pr-6 text-right">
                                                    {member.userID !== myUserID && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            className="h-8 w-8 text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
                                                            onClick={() =>
                                                                handleRemoveMember(member.userID)
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                    {isAdmin && hasChanges && (
                        <CardFooter className="flex justify-end border-t bg-muted/10 py-4 pr-6">
                            <Button
                                onClick={handleSaveChanges}
                                disabled={isSaving}
                                className="shadow-lg"
                            >
                                {isSaving ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="mr-2 h-4 w-4" />
                                )}
                                Save Member Changes
                            </Button>
                        </CardFooter>
                    )}
                </Card>

                {/* New Short Link Section */}
                <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex items-center justify-between bg-muted/5">
                        <div className="space-y-1">
                            <CardTitle className="text-xl">Create a New Short Link</CardTitle>
                            <CardDescription>
                                Short links help you to easily share long URLs with your world.
                            </CardDescription>
                        </div>
                        <div>
                            <Button onClick={() => router.push(`/w/${workspaceID}/create-url`)}>
                                <Plus className="mr-2 h-4 w-4" /> New Short Link
                            </Button>
                        </div>
                    </CardHeader>
                </Card>

                {/* Bulk Upload Section */}
                {permission !== "viewer" && (
                    <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader className="flex items-center justify-between bg-muted/5">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-xl">
                                        Bulk Upload Short URLs
                                    </CardTitle>
                                </div>
                                <CardDescription>
                                    Upload a CSV file to create multiple short URLs at once.
                                </CardDescription>
                            </div>
                            <div>
                                <Button
                                    variant="outline"
                                    onClick={() => router.push(`/w/${workspaceID}/bulk-upload`)}
                                >
                                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Bulk Upload
                                </Button>
                            </div>
                        </CardHeader>
                    </Card>
                )}

                <Separator />

                <WorkspacePerformance workspacePerformance={workspacePerformance} />

                <Separator />
                {/* Danger Zone */}
                {/* FUCKING PERFECT!!! */}
                <Card className="overflow-hidden border-destructive/20 bg-destructive/5 dark:bg-destructive/10">
                    <CardHeader className="border-b border-destructive/10 pb-4">
                        <CardTitle className="flex items-center gap-2 text-xl text-destructive">
                            <Shield className="h-5 w-5" /> Danger Zone
                        </CardTitle>
                        <CardDescription className="text-destructive/70">
                            Actions that could result in permanent data loss.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="divide-y divide-destructive/10 p-0">
                        <div className="flex items-center justify-between p-6 transition-colors hover:bg-destructive/5">
                            <div className="space-y-1">
                                <p className="font-semibold text-foreground">Leave Workspace</p>
                                <p className="text-sm text-muted-foreground">
                                    You will lose access to all projects and data in this workspace.
                                </p>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger>
                                    <Button
                                        variant="outline"
                                        className="border-destructive/30 text-destructive hover:bg-destructive/10 bg-transparent"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" /> Leave
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Leave this workspace?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will revoke your access to {workspaceData.title}.
                                            You'll need an invite from an admin to join again.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Go Back</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleLeaveWorkspace}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            Leave Workspace
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>

                        {isAdmin && (
                            <div className="flex items-center justify-between p-6 transition-colors hover:bg-destructive/5">
                                <div className="space-y-1">
                                    <p className="font-semibold text-destructive">
                                        Delete Workspace
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Permanently remove this workspace and all associated data.
                                    </p>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger>
                                        <Button variant="destructive" className="shadow-md">
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete Workspace
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="text-destructive">
                                                Permanently delete workspace?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. All data, projects,
                                                and member associations will be wiped from our
                                                servers.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDeleteWorkspace}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                Delete Permanently
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

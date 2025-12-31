"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Users, AlertCircle, Link, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toastError } from "@/lib/toast-error";
import { backend } from "@/config/backend";
import { handleResponse } from "@/lib/handle-response";
import { useRouter } from "next/navigation";
import { EMAIL } from "@/constants/regex";
import TopBackButton from "./top-back-button";

interface Member {
    id: string;
    email: string;
    permission: "admin" | "member" | "viewer";
}

export function CreateWorkspaceForm() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [members, setMembers] = useState<Member[]>([]);
    const [newMemberEmail, setNewMemberEmail] = useState("");
    const [newMemberPermission, setNewMemberPermission] = useState<"admin" | "member" | "viewer">(
        "member"
    );
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();

    const validateEmail = (email: string) => {
        return EMAIL.test(email);
    };

    const addMember = () => {
        const newErrors: Record<string, string> = {};

        if (!newMemberEmail) {
            newErrors.memberEmail = "Email is required";
        } else if (!validateEmail(newMemberEmail)) {
            newErrors.memberEmail = "Please enter a valid email address";
        } else if (members.some((m) => m.email.toLowerCase() === newMemberEmail.toLowerCase())) {
            newErrors.memberEmail = "This email has already been added";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const newMember: Member = {
            id: Math.random().toString(36).substr(2, 9),
            email: newMemberEmail,
            permission: newMemberPermission,
        };

        setMembers([...members, newMember]);
        setNewMemberEmail("");
        setNewMemberPermission("member");
        setErrors({});
    };

    const removeMember = (id: string) => {
        setMembers(members.filter((m) => m.id !== id));
    };

    const updateMemberPermission = (id: string, permission: "admin" | "member" | "viewer") => {
        setMembers(members.map((m) => (m.id === id ? { ...m, permission } : m)));
    };

    // NOTE: this !
    const handleSubmit = async () => {
        const newErrors: Record<string, string> = {};

        if (title.length < 3) {
            newErrors.title = "Title must be at least 3 characters long";
        }
        if (description.length < 10) {
            newErrors.description = "Description must be at least 10 characters long";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setIsSubmitting(true);

            const payload = {
                title,
                description,
                members: members.map(({ email, permission }) => ({ email, permission })),
            };

            console.log("Submitting payload:", payload);

            const { data: resData } = await backend.post(
                "/api/v1/workspace/create-workspace",
                payload
            );

            if (handleResponse(resData)) {
                router.push(`/w/${resData.data.workspace._id}`);
            }
        } catch (error) {
            toastError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <div>
                <TopBackButton />
            </div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Create Workspace</h1>
                <p className="mt-2 text-muted-foreground">
                    Set up a new workspace to collaborate with your team
                </p>
            </div>

            <div className="space-y-8">
                {/* Workspace Details */}
                <div className="rounded-lg border bg-card p-6">
                    <h2 className="mb-4 text-lg font-semibold">Workspace Details</h2>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Workspace Title *</Label>
                            <Input
                                id="title"
                                placeholder="e.g., Product Development"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    if (errors.title) {
                                        setErrors({ ...errors, title: "" });
                                    }
                                }}
                                className={errors.title ? "border-destructive" : ""}
                            />
                            {errors.title && (
                                <p className="mt-1 text-xs text-destructive">{errors.title}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe the purpose of this workspace..."
                                value={description}
                                onChange={(e) => {
                                    setDescription(e.target.value);
                                    if (errors.description) {
                                        setErrors({ ...errors, description: "" });
                                    }
                                }}
                                className={errors.description ? "border-destructive" : ""}
                                rows={3}
                            />
                            {errors.description && (
                                <p className="mt-1 text-xs text-destructive">
                                    {errors.description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Add Members */}
                <div className="rounded-lg border bg-card p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Team Members</h2>
                        <Badge variant="secondary" className="text-xs">
                            {members.length} {members.length === 1 ? "member" : "members"}
                        </Badge>
                    </div>

                    <div className="space-y-4">
                        {/* Add Member Form */}
                        <div className="rounded-lg border border-dashed bg-muted/30 p-4">
                            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                                <div className="space-y-2">
                                    <Label htmlFor="memberEmail" className="text-xs">
                                        Email Address
                                    </Label>
                                    <Input
                                        id="memberEmail"
                                        type="email"
                                        placeholder="colleague@company.com"
                                        value={newMemberEmail}
                                        onChange={(e) => {
                                            setNewMemberEmail(e.target.value);
                                            if (errors.memberEmail) {
                                                setErrors({ ...errors, memberEmail: "" });
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                addMember();
                                            }
                                        }}
                                        className={errors.memberEmail ? "border-destructive" : ""}
                                    />
                                    {errors.memberEmail && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {errors.memberEmail}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="memberPermission" className="text-xs">
                                        Permission
                                    </Label>
                                    <Select
                                        value={newMemberPermission}
                                        onValueChange={(value) => setNewMemberPermission(value!)}
                                    >
                                        <SelectTrigger id="memberPermission" className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="member">Member</SelectItem>
                                            <SelectItem value="viewer">Viewer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center sm:mt-4">
                                    <Button onClick={addMember} size="default" className="gap-1.5">
                                        <Plus className="h-4 w-4" />
                                        Add
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Members List */}
                        {members.length > 0 ? (
                            <div className="space-y-2">
                                {members.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50"
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <Users className="h-4 w-4" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium truncate">
                                                {member.email}
                                            </p>
                                        </div>

                                        <Select
                                            value={member.permission}
                                            onValueChange={(value) =>
                                                updateMemberPermission(member.id, value!)
                                            }
                                        >
                                            <SelectTrigger className="w-32 h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="member">Member</SelectItem>
                                                <SelectItem value="viewer">Viewer</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => removeMember(member.id)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    No members added yet. Add team members using the form above.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 border-t pt-6">
                    <Button variant="outline">Cancel</Button>
                    <Button onClick={handleSubmit} loading={isSubmitting}>
                        Create Workspace
                    </Button>
                </div>
            </div>
        </div>
    );
}

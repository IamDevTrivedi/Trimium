"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { z } from "zod";
import {
    Plus,
    Trash2,
    GripVertical,
    ExternalLink,
    Eye,
    Save,
    Link2,
    Check,
    Copy,
    Palette,
    Upload,
    Loader2,
} from "lucide-react";
import { backend } from "@/config/backend";
import { toastError } from "@/lib/toast-error";
import { Toast } from "@/components/toast";
import { useUserStore } from "@/store/user-store";
import { SOCIAL_PLATFORMS } from "@/constants/socials";
import { LINKHUB_THEMES, LinkhubThemeId } from "@/constants/linkhub-themes";
import { cn } from "@/lib/utils";
import config from "@/config/env";
import { LoadingPage } from "./loading";

interface LinkhubLink {
    id: string;
    title: string;
    url: string;
    isActive: boolean;
}

interface LinkhubSocials {
    instagram?: string;
    linkedin?: string;
    github?: string;
    x?: string;
    youtube?: string;
    tiktok?: string;
    portfolio?: string;
    email?: string;
}

interface LinkhubData {
    title: string;
    bio: string;
    avatarUrl: string;
    links: LinkhubLink[];
    socials: LinkhubSocials;
    theme: LinkhubThemeId;
    isPublished: boolean;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export function LinkhubEditor() {
    const { user } = useUserStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(false);
    const [changed, setChanged] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [data, setData] = useState<LinkhubData>({
        title: "",
        bio: "",
        avatarUrl: "",
        links: [],
        socials: {},
        theme: "midnight",
        isPublished: false,
    });

    const [originalData, setOriginalData] = useState<LinkhubData>({
        title: "",
        bio: "",
        avatarUrl: "",
        links: [],
        socials: {},
        theme: "midnight",
        isPublished: false,
    });

    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const profileUrl = user?.username ? `${config.PUBLIC_FRONTEND_URL}/t/${user.username}` : "";

    useEffect(() => {
        fetchLinkhub();
    }, []);

    useEffect(() => {
        setChanged(JSON.stringify(data) !== JSON.stringify(originalData));
    }, [data, originalData]);

    const fetchLinkhub = async () => {
        try {
            const response = await backend.post("/api/v1/linkhub/get-my-profile");
            if (response.data.success) {
                const linkhub = response.data.data;
                setOriginalData({
                    title: linkhub.title || "",
                    bio: linkhub.bio || "",
                    avatarUrl: linkhub.avatarUrl || "",
                    links: linkhub.links || [],
                    socials: linkhub.socials || {},
                    theme: linkhub.theme || "midnight",
                    isPublished: linkhub.isPublished || false,
                });

                setData({
                    title: linkhub.title || "",
                    bio: linkhub.bio || "",
                    avatarUrl: linkhub.avatarUrl || "",
                    links: linkhub.links || [],
                    socials: linkhub.socials || {},
                    theme: linkhub.theme || "midnight",
                    isPublished: linkhub.isPublished || false,
                });
            }
        } catch (error) {
            toastError(error);
        } finally {
            setLoading(false);
        }
    };

    // TODO: validation
    const saveLinkhub = async () => {
        if (
            z
                .array(
                    z.object({
                        title: z.string().min(1),
                        url: z.url(),
                    })
                )
                .safeParse(data.links).success === false
        ) {
            Toast.error("Invalid link entries detected", {
                description: "Please ensure all links have a valid title and URL.",
            });

            return;
        }

        if (data.socials.email && z.email().safeParse(data.socials.email).success === false) {
            Toast.error("Invalid email address", {
                description: "Please enter a valid email format",
            });

            return;
        }

        if (data.socials.portfolio && z.url().safeParse(data.socials.portfolio).success === false) {
            Toast.error("Invalid portfolio URL", {
                description: "Please enter a valid URL format",
            });

            return;
        }

        try {
            setSaving(true);
            const response = await backend.post("/api/v1/linkhub/update-my-profile", data);
            if (response.data.success) {
                Toast.success("Profile saved successfully!");
            }
        } catch (error) {
            toastError(error);
        } finally {
            setSaving(false);
        }
    };

    const addLink = () => {
        setData((prev) => ({
            ...prev,
            links: [...prev.links, { id: generateId(), title: "", url: "", isActive: true }],
        }));
    };

    const updateLink = (id: string, field: keyof LinkhubLink, value: any) => {
        setData((prev) => ({
            ...prev,
            links: prev.links.map((link) => (link.id === id ? { ...link, [field]: value } : link)),
        }));
    };

    const removeLink = (id: string) => {
        setData((prev) => ({
            ...prev,
            links: prev.links.filter((link) => link.id !== id),
        }));
    };

    const updateSocial = (platformId: string, value: string) => {
        setData((prev) => ({
            ...prev,
            socials: { ...prev.socials, [platformId]: value },
        }));
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newLinks = [...data.links];
        const draggedLink = newLinks[draggedIndex];
        newLinks.splice(draggedIndex, 1);
        newLinks.splice(index, 0, draggedLink);

        setData((prev) => ({ ...prev, links: newLinks }));
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const copyProfileUrl = async () => {
        if (!profileUrl) return;
        await navigator.clipboard.writeText(profileUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            Toast.error("Invalid file type", {
                description: "Please upload an image file",
            });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            Toast.error("File too large", {
                description: "Please upload an image smaller than 5MB",
            });
            return;
        }

        try {
            setUploadingAvatar(true);

            const formData = new FormData();
            formData.append("avatar", file);

            const response = await backend.post("/api/v1/linkhub/update-avatar", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.success) {
                setData((prev) => ({
                    ...prev,
                    avatarUrl: response.data.data.url,
                }));
                Toast.success("Avatar uploaded successfully!");
            }
        } catch (error) {
            toastError(error);
        } finally {
            setUploadingAvatar(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    if (loading) {
        return <LoadingPage />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Link Profile</h1>
                    <p className="text-muted-foreground">
                        Create your personalized link-in-bio page
                    </p>
                </div>
                <div className="flex gap-2">
                    {user?.username && (
                        <Button variant="outline">
                            <a
                                className={"flex items-center justify-center"}
                                href={`/t/${user.username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                            </a>
                        </Button>
                    )}
                    <Button onClick={saveLinkhub} disabled={!changed || saving} loading={saving}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                    </Button>
                </div>
            </div>

            {user?.username && (
                <Card>
                    <CardHeader>
                        <CardTitle>Your Profile URL</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Link2 className="w-4 h-4 text-muted-foreground shrink-0" />
                            <code className="flex-1 text-sm bg-muted px-3 py-2 rounded-md overflow-x-auto">
                                {profileUrl}
                            </code>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={copyProfileUrl}
                                className="shrink-0"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </Button>
                            <Button variant="outline" size="sm" className="shrink-0">
                                <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <Card>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-medium">Publish Profile</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Make your profile visible to everyone
                                    </p>
                                </div>
                                <Switch
                                    checked={data.isPublished}
                                    onCheckedChange={(checked) =>
                                        setData((prev) => ({ ...prev, isPublished: checked }))
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Set your display name and bio</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Display Name</Label>
                                <Input
                                    id="title"
                                    placeholder="Your Name"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData((prev) => ({
                                            ...prev,
                                            title: e.target.value,
                                        }))
                                    }
                                    maxLength={100}
                                />
                                <p className="text-sm text-muted-foreground">
                                    Your account name will be used as default
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    placeholder="Tell people about yourself..."
                                    value={data.bio}
                                    onChange={(e) =>
                                        setData((prev) => ({ ...prev, bio: e.target.value }))
                                    }
                                    maxLength={500}
                                    rows={3}
                                />
                                <p className="text-xs text-muted-foreground text-right">
                                    {data.bio.length}/500
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="avatarUrl">Avatar</Label>
                                <div className="space-y-3">
                                    {data.avatarUrl && (
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={data.avatarUrl}
                                                alt="Avatar preview"
                                                className="w-16 h-16 rounded-full object-cover border-2 border-border"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display =
                                                        "none";
                                                }}
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">Avatar uploaded</p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setData((prev) => ({
                                                        ...prev,
                                                        avatarUrl: "",
                                                    }))
                                                }
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingAvatar}
                                            className="flex-1"
                                        >
                                            {uploadingAvatar ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Uploading...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    Upload Image
                                                </>
                                            )}
                                        </Button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleAvatarUpload}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        JPG, PNG or GIF (max 5MB)
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Links */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Links</CardTitle>
                                    <CardDescription>Add up to 20 custom links</CardDescription>
                                </div>
                                <Button
                                    onClick={addLink}
                                    size="sm"
                                    disabled={data.links.length >= 20}
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add Link
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {data.links.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Link2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>No links yet. Add your first link!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {data.links.map((link, index) => (
                                        <div
                                            key={link.id}
                                            draggable
                                            onDragStart={() => handleDragStart(index)}
                                            onDragOver={(e) => handleDragOver(e, index)}
                                            onDragEnd={handleDragEnd}
                                            className={cn(
                                                "group p-4 border rounded-lg transition-all",
                                                draggedIndex === index
                                                    ? "opacity-50 border-primary"
                                                    : "hover:border-primary/50"
                                            )}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="cursor-grab pt-2">
                                                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                                                </div>
                                                <div className="flex-1 space-y-3">
                                                    <Input
                                                        placeholder="Link Title"
                                                        value={link.title}
                                                        onChange={(e) =>
                                                            updateLink(
                                                                link.id,
                                                                "title",
                                                                e.target.value
                                                            )
                                                        }
                                                        maxLength={100}
                                                    />
                                                    <Input
                                                        placeholder="https://example.com"
                                                        value={link.url}
                                                        onChange={(e) =>
                                                            updateLink(
                                                                link.id,
                                                                "url",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2 pt-2">
                                                    <Switch
                                                        checked={link.isActive}
                                                        onCheckedChange={(checked) =>
                                                            updateLink(link.id, "isActive", checked)
                                                        }
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeLink(link.id)}
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Social Profiles */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Social Profiles</CardTitle>
                            <CardDescription>Add your social media handles</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {SOCIAL_PLATFORMS.map((platform) => {
                                    const Icon = platform.icon;
                                    return (
                                        <div key={platform.id} className="space-y-2">
                                            <Label className="flex items-center gap-2">
                                                <Icon className="w-4 h-4" />
                                                {platform.name}
                                            </Label>
                                            <Input
                                                placeholder={platform.placeholder}
                                                value={
                                                    data.socials[
                                                    platform.id as keyof LinkhubSocials
                                                    ] || ""
                                                }
                                                onChange={(e) =>
                                                    updateSocial(platform.id, e.target.value)
                                                }
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="w-5 h-5" />
                                Theme
                            </CardTitle>
                            <CardDescription>Choose a theme for your profile page</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-3">
                                {Object.values(LINKHUB_THEMES).map((theme) => (
                                    <button
                                        key={theme.id}
                                        onClick={() =>
                                            setData((prev) => ({
                                                ...prev,
                                                theme: theme.id as LinkhubThemeId,
                                            }))
                                        }
                                        className={cn(
                                            "relative p-4 rounded-xl border-2 transition-all text-left",
                                            data.theme === theme.id
                                                ? "border-primary ring-2 ring-primary/20"
                                                : "border-border hover:border-primary/50"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Theme Preview */}
                                            <div
                                                className={cn(
                                                    "w-16 h-16 rounded-lg shrink-0",
                                                    theme.background
                                                )}
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium">{theme.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {theme.description}
                                                </p>
                                            </div>
                                            {data.theme === theme.id && (
                                                <Badge variant="secondary">
                                                    <Check className="w-3 h-3 mr-1" />
                                                    Active
                                                </Badge>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Eye className="w-5 h-5" />
                                Live Preview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div
                                className={cn(
                                    "rounded-xl p-6 min-h-[400px]",
                                    LINKHUB_THEMES[data.theme].background
                                )}
                            >
                                <div className="max-w-xs mx-auto">
                                    {/* Avatar Preview */}
                                    <div className="flex justify-center mb-4">
                                        {data.avatarUrl ? (
                                            <img
                                                src={data.avatarUrl}
                                                alt="Avatar"
                                                className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display =
                                                        "none";
                                                }}
                                            />
                                        ) : (
                                            <div
                                                className={cn(
                                                    "w-16 h-16 rounded-full flex items-center justify-center border-2 border-white/20",
                                                    LINKHUB_THEMES[data.theme].card
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        "text-xl font-bold",
                                                        LINKHUB_THEMES[data.theme].text
                                                    )}
                                                >
                                                    {(data.title?.[0] || "U").toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Title Preview */}
                                    <h2
                                        className={cn(
                                            "text-lg font-bold text-center mb-1",
                                            LINKHUB_THEMES[data.theme].text
                                        )}
                                    >
                                        {data.title || "Your Name"}
                                    </h2>

                                    {/* Username Preview */}
                                    <p
                                        className={cn(
                                            "text-center text-xs mb-3",
                                            LINKHUB_THEMES[data.theme].textMuted
                                        )}
                                    >
                                        @{user?.username || "username"}
                                    </p>

                                    {/* Bio Preview */}
                                    {data.bio && (
                                        <p
                                            className={cn(
                                                "text-center text-sm mb-4 line-clamp-2",
                                                LINKHUB_THEMES[data.theme].textSecondary
                                            )}
                                        >
                                            {data.bio}
                                        </p>
                                    )}

                                    {/* Social Icons Preview */}
                                    {Object.values(data.socials).some((v) => v) && (
                                        <div className="flex justify-center gap-2 mb-4">
                                            {SOCIAL_PLATFORMS.filter(
                                                (p) => data.socials[p.id as keyof LinkhubSocials]
                                            )
                                                .slice(0, 5)
                                                .map((platform) => {
                                                    const Icon = platform.icon;
                                                    return (
                                                        <div
                                                            key={platform.id}
                                                            className={cn(
                                                                "p-2 rounded-full",
                                                                LINKHUB_THEMES[data.theme]
                                                                    .socialButton
                                                            )}
                                                        >
                                                            <Icon className="w-3 h-3" />
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    )}

                                    {/* Links Preview */}
                                    <div className="space-y-2">
                                        {data.links
                                            .filter((l) => l.isActive && l.title)
                                            .slice(0, 3)
                                            .map((link) => (
                                                <div
                                                    key={link.id}
                                                    className={cn(
                                                        "p-2 rounded-lg border text-center text-sm",
                                                        LINKHUB_THEMES[data.theme].card,
                                                        LINKHUB_THEMES[data.theme].text
                                                    )}
                                                >
                                                    {link.title}
                                                </div>
                                            ))}
                                        {data.links.filter((l) => l.isActive && l.title).length >
                                            3 && (
                                                <p
                                                    className={cn(
                                                        "text-center text-xs",
                                                        LINKHUB_THEMES[data.theme].textMuted
                                                    )}
                                                >
                                                    +
                                                    {data.links.filter((l) => l.isActive && l.title)
                                                        .length - 3}{" "}
                                                    more links
                                                </p>
                                            )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

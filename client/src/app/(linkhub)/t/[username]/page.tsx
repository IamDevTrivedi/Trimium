"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, ExternalLink, User } from "lucide-react";
import { backend } from "@/config/backend";
import { getTheme } from "@/constants/linkhub-themes";
import { SOCIAL_PLATFORMS, getSocialUrl } from "@/constants/socials";
import { cn } from "@/lib/utils";
import Link from "next/link";

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

interface LinkhubProfile {
    username: string;
    firstName: string;
    lastName: string;
    title: string;
    bio: string;
    avatarUrl?: string;
    links: LinkhubLink[];
    socials: LinkhubSocials;
    theme: string;
}

export default function LinkhubPage() {
    const params = useParams();
    const username = params.username as string;

    const [profile, setProfile] = useState<LinkhubProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await backend.get(`/api/v1/linkhub/u/${username}`);
                if (response.data.success) {
                    setProfile(response.data.data);
                } else {
                    setError(response.data.message || "Profile not found");
                }
            } catch (err: any) {
                setError(err.response?.data?.message || "Profile not found or not published");
            } finally {
                setLoading(false);
            }
        };

        if (username) {
            fetchProfile();
        }
    }, [username]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="text-center px-4">
                    <User className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Profile Not Found</h1>
                    <p className="text-slate-400">
                        This profile doesn&apos;t exist or hasn&apos;t been published yet.
                    </p>
                </div>
            </div>
        );
    }

    const theme = getTheme(profile.theme);

    const activeSocials = SOCIAL_PLATFORMS.filter(
        (platform) => profile.socials[platform.id as keyof LinkhubSocials]
    );

    return (
        <div className={cn("min-h-screen w-full py-12 px-4", theme.background, theme.font)}>
            <div className="max-w-lg mx-auto">
                {/* Avatar */}
                <div className="flex justify-center mb-6">
                    {profile.avatarUrl ? (
                        <img
                            src={profile.avatarUrl}
                            alt={profile.title || profile.username}
                            className="w-24 h-24 rounded-full object-cover border-4 border-white/20 shadow-xl"
                        />
                    ) : (
                        <div
                            className={cn(
                                "w-24 h-24 rounded-full flex items-center justify-center border-4 border-white/20 shadow-xl",
                                theme.card
                            )}
                        >
                            <span className={cn("text-3xl font-bold", theme.text)}>
                                {(profile.firstName?.[0] || profile.username[0]).toUpperCase()}
                            </span>
                        </div>
                    )}
                </div>

                {/* Title */}
                <h1 className={cn("text-2xl font-bold text-center mb-2", theme.text)}>
                    {profile.title || `${profile.firstName} ${profile.lastName}`}
                </h1>

                {/* Username */}
                <p className={cn("text-center text-sm mb-4", theme.textMuted)}>
                    @{profile.username}
                </p>

                {/* Bio */}
                {profile.bio && (
                    <p
                        className={cn(
                            "text-center mb-8 max-w-md mx-auto whitespace-pre-wrap",
                            theme.textSecondary
                        )}
                    >
                        {profile.bio}
                    </p>
                )}

                {/* Social Icons */}
                {activeSocials.length > 0 && (
                    <div className="flex justify-center gap-3 mb-8 flex-wrap">
                        {activeSocials.map((platform) => {
                            const value = profile.socials[platform.id as keyof LinkhubSocials];
                            if (!value) return null;

                            const Icon = platform.icon;
                            const url = getSocialUrl(platform.id, value);

                            return (
                                <a
                                    key={platform.id}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                        "p-3 rounded-full transition-all duration-200 transform hover:scale-110",
                                        theme.socialButton
                                    )}
                                    title={platform.name}
                                >
                                    <Icon className="w-5 h-5" />
                                </a>
                            );
                        })}
                    </div>
                )}

                {/* Links */}
                <div className="space-y-3">
                    {profile.links.map((link) => (
                        <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                "block w-full p-4 rounded-xl border text-center transition-all duration-200 transform hover:scale-[1.02] group",
                                theme.card
                            )}
                        >
                            <span className={cn("font-medium", theme.text)}>{link.title}</span>
                            <ExternalLink
                                className={cn(
                                    "inline-block w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity",
                                    theme.textMuted
                                )}
                            />
                        </a>
                    ))}
                </div>

                {/* Footer */}
                <div className={cn("text-center mt-12 text-sm", theme.textMuted)}>
                    <Link href="/" className="hover:underline inline-flex items-center gap-1">
                        Powered by Trimium
                    </Link>
                </div>
            </div>
        </div>
    );
}

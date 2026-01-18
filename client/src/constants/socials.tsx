import { Instagram, Linkedin, Github, Youtube, Globe, Mail, type LucideIcon } from "lucide-react";

export const XIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

export const TikTokIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
);

export interface SocialPlatform {
    id: string;
    name: string;
    icon: LucideIcon | React.FC<{ className?: string }>;
    placeholder: string;
    urlPrefix: string;
    color: string;
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
    {
        id: "instagram",
        name: "Instagram",
        icon: Instagram,
        placeholder: "username or profile URL",
        urlPrefix: "https://instagram.com/",
        color: "#E4405F",
    },
    {
        id: "linkedin",
        name: "LinkedIn",
        icon: Linkedin,
        placeholder: "username or profile URL",
        urlPrefix: "https://linkedin.com/in/",
        color: "#0A66C2",
    },
    {
        id: "github",
        name: "GitHub",
        icon: Github,
        placeholder: "username",
        urlPrefix: "https://github.com/",
        color: "#181717",
    },
    {
        id: "x",
        name: "X (Twitter)",
        icon: XIcon,
        placeholder: "username",
        urlPrefix: "https://x.com/",
        color: "#000000",
    },
    {
        id: "youtube",
        name: "YouTube",
        icon: Youtube,
        placeholder: "channel name or @handle",
        urlPrefix: "https://youtube.com/@",
        color: "#FF0000",
    },
    {
        id: "tiktok",
        name: "TikTok",
        icon: TikTokIcon,
        placeholder: "username",
        urlPrefix: "https://tiktok.com/@",
        color: "#000000",
    },
    {
        id: "portfolio",
        name: "Portfolio",
        icon: Globe,
        placeholder: "https://yourwebsite.com",
        urlPrefix: "",
        color: "#6366F1",
    },
    {
        id: "email",
        name: "Email",
        icon: Mail,
        placeholder: "your@email.com",
        urlPrefix: "mailto:",
        color: "#EA4335",
    },
];

export const getSocialUrl = (platformId: string, value: string): string => {
    const platform = SOCIAL_PLATFORMS.find((p) => p.id === platformId);
    if (!platform || !value) return "";

    if (value.startsWith("http://") || value.startsWith("https://")) {
        return value;
    }

    if (platformId === "email") {
        return `mailto:${value}`;
    }

    if (platformId === "portfolio") {
        return value.startsWith("http") ? value : `https://${value}`;
    }

    return `${platform.urlPrefix}${value.replace(/^@/, "")}`;
};

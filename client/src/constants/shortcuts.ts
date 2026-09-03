export type ShortcutContext =
    | "global"
    | "workspace"
    | "workspace-list"
    | "shortlink"
    | "form"
    | "qr";

export interface ShortcutDefinition {
    id: string;
    name: string;
    combo: string[];
    context: ShortcutContext;
    keywords?: string;
}

export const SHORTCUT_CONTEXT_LABELS: Record<ShortcutContext, string> = {
    global: "Global",
    workspace: "Workspace",
    "workspace-list": "Workspaces",
    shortlink: "Short Link",
    form: "Forms",
    qr: "QR Generator",
};

export const PALETTE_TOGGLES: string[][] = [
    ["shift", "?"],
    ["mod", "k"],
];

export const SHORTCUTS: ShortcutDefinition[] = [
    {
        id: "toggle-theme",
        name: "Toggle theme",
        combo: ["t"],
        context: "global",
        keywords: "dark light mode system appearance",
    },
    {
        id: "go-home",
        name: "Go to Home",
        combo: ["g", "h"],
        context: "global",
        keywords: "navigate landing page",
    },
    {
        id: "go-workspaces",
        name: "Go to Workspaces",
        combo: ["g", "w"],
        context: "global",
        keywords: "navigate workspace list",
    },
    {
        id: "go-account",
        name: "Go to Account",
        combo: ["g", "a"],
        context: "global",
        keywords: "profile settings",
    },
    {
        id: "go-login-activity",
        name: "Go to Login Activity",
        combo: ["g", "l"],
        context: "global",
        keywords: "sessions devices security",
    },
    {
        id: "go-qr-generator",
        name: "Go to QR Generator",
        combo: ["g", "q"],
        context: "global",
        keywords: "qr code generator",
    },
    {
        id: "go-linkhub-editor",
        name: "Go to Linkhub Editor",
        combo: ["g", "e"],
        context: "global",
        keywords: "link in bio",
    },
    {
        id: "go-features",
        name: "Go to Features",
        combo: ["g", "f"],
        context: "global",
        keywords: "landing marketing",
    },

    {
        id: "new-short-link",
        name: "New Short Link",
        combo: ["n"],
        context: "workspace",
        keywords: "create shorten url",
    },
    {
        id: "bulk-upload",
        name: "Bulk Upload",
        combo: ["b"],
        context: "workspace",
        keywords: "csv multiple links",
    },
    {
        id: "workspace-tags",
        name: "Tags & Settings",
        combo: ["s"],
        context: "workspace",
        keywords: "manage tags workspace settings",
    },

    {
        id: "new-workspace",
        name: "New Workspace",
        combo: ["n"],
        context: "workspace-list",
        keywords: "create workspace team",
    },

    {
        id: "edit-short-link",
        name: "Edit Short Link",
        combo: ["e"],
        context: "shortlink",
        keywords: "edit redirect",
    },
    {
        id: "copy-short-url",
        name: "Copy Short URL",
        combo: ["y"],
        context: "shortlink",
        keywords: "copy short link clipboard",
    },
    {
        id: "copy-original-url",
        name: "Copy Original URL",
        combo: ["c"],
        context: "shortlink",
        keywords: "copy destination url clipboard",
    },

    {
        id: "save-form",
        name: "Save & Submit",
        combo: ["mod", "s"],
        context: "form",
        keywords: "save form submit",
    },

    {
        id: "download-qr",
        name: "Download QR Code",
        combo: ["mod", "s"],
        context: "qr",
        keywords: "save download qr png",
    },
];

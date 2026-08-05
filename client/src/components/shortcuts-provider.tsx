"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import { ShortcutPalette } from "@/components/shortcut-palette";
import {
    PALETTE_TOGGLES,
    SHORTCUTS,
    type ShortcutContext,
    type ShortcutDefinition,
} from "@/constants/shortcuts";
import { comboEquals, comboMatches, isTypingTarget, parseKey } from "@/hooks/use-hotkey";

interface ShortcutsContextValue {
    activeShortcuts: ShortcutDefinition[];
    currentContext: ShortcutContext;
    registerAction: (id: string, action: () => void) => void;
    unregisterAction: (id: string) => void;
    runShortcut: (id: string) => void;
}

const ShortcutsContext = React.createContext<ShortcutsContextValue | null>(null);

function contextFromPath(pathname: string): ShortcutContext {
    if (pathname === "/qr-generator") return "qr";
    if (pathname === "/w/new") return "form";
    if (pathname === "/w") return "workspace-list";

    if (pathname.startsWith("/w/")) {
        const segments = pathname.split("/").filter(Boolean);
        const rest = segments.slice(2);

        if (rest.length === 0) return "workspace";

        const last = rest[rest.length - 1];
        if (last === "edit" || last === "create-url" || last === "bulk-upload") {
            return "form";
        }

        if (rest.length === 1) return "shortlink";

        return "form";
    }

    return "global";
}

export function ShortcutsProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();

    const [isPaletteOpen, setIsPaletteOpen] = React.useState(false);
    const [registeredIds, setRegisteredIds] = React.useState<Set<string>>(() => new Set());
    const actionsRef = React.useRef(new Map<string, () => void>());
    const themeRef = React.useRef<string | undefined>(undefined);
    const pendingPrefixRef = React.useRef<string | null>(null);
    const pendingTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const currentContext = React.useMemo(() => contextFromPath(pathname), [pathname]);

    React.useEffect(() => {
        themeRef.current = theme;
    }, [theme]);

    const registerAction = React.useCallback((id: string, action: () => void) => {
        actionsRef.current.set(id, action);
        setRegisteredIds((prev) => {
            if (prev.has(id)) return prev;
            const next = new Set(prev);
            next.add(id);
            return next;
        });
    }, []);

    const unregisterAction = React.useCallback((id: string) => {
        actionsRef.current.delete(id);
        setRegisteredIds((prev) => {
            if (!prev.has(id)) return prev;
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    }, []);

    React.useEffect(() => {
        registerAction("toggle-theme", () => {
            const current = themeRef.current;
            const next = current === "light" ? "dark" : current === "dark" ? "system" : "light";
            setTheme(next);
        });
        registerAction("go-home", () => router.push("/"));
        registerAction("go-workspaces", () => router.push("/w"));
        registerAction("go-account", () => router.push("/account"));
        registerAction("go-login-activity", () => router.push("/account/login-activity"));
        registerAction("go-qr-generator", () => router.push("/qr-generator"));
        registerAction("go-linkhub-editor", () => router.push("/linkhub-editor"));
        registerAction("go-features", () => router.push("/features"));
    }, [registerAction, router, setTheme]);

    React.useEffect(() => {
        if (currentContext === "workspace") {
            const match = pathname.match(/^\/w\/([^/]+)\/?$/);
            const workspaceID = match?.[1];
            if (!workspaceID) return;

            registerAction("new-short-link", () => router.push(`/w/${workspaceID}/create-url`));
            registerAction("bulk-upload", () => router.push(`/w/${workspaceID}/bulk-upload`));
            registerAction("workspace-tags", () => {
                const target = document.getElementById("workspace-tags");
                target?.scrollIntoView({ behavior: "smooth", block: "start" });
            });

            return () => {
                unregisterAction("new-short-link");
                unregisterAction("bulk-upload");
                unregisterAction("workspace-tags");
            };
        }

        if (currentContext === "workspace-list") {
            registerAction("new-workspace", () => router.push("/w/new"));
            return () => unregisterAction("new-workspace");
        }

        if (currentContext === "shortlink") {
            const match = pathname.match(/^\/w\/([^/]+)\/([^/]+)$/);
            if (!match) return;

            const [, workspaceID, shortCode] = match;
            registerAction("edit-short-link", () =>
                router.push(`/w/${workspaceID}/${shortCode}/edit`)
            );

            return () => unregisterAction("edit-short-link");
        }
    }, [currentContext, pathname, router, registerAction, unregisterAction]);

    const activeShortcuts = React.useMemo(
        () =>
            SHORTCUTS.filter((shortcut) => {
                if (shortcut.context !== "global" && shortcut.context !== currentContext) {
                    return false;
                }
                return registeredIds.has(shortcut.id);
            }),
        [currentContext, registeredIds]
    );

    const runShortcut = React.useCallback((id: string) => {
        const action = actionsRef.current.get(id);
        if (!action) return;
        setIsPaletteOpen(false);
        action();
    }, []);

    React.useEffect(() => {
        const isToggleCombo = (pressed: ReturnType<typeof parseKey>) =>
            PALETTE_TOGGLES.some((combo) => comboMatches(combo, pressed));

        const handleKeyDown = (event: KeyboardEvent) => {
            const pressed = parseKey(event);

            if (isToggleCombo(pressed)) {
                event.preventDefault();
                setIsPaletteOpen((open) => !open);
                return;
            }

            if (isPaletteOpen) return;

            const typing = isTypingTarget(document.activeElement);
            if (typing && !(pressed.mod && !pressed.alt && !pressed.shift)) {
                return;
            }

            if (pendingPrefixRef.current) {
                if (pendingTimeoutRef.current) {
                    clearTimeout(pendingTimeoutRef.current);
                    pendingTimeoutRef.current = null;
                }
                pendingPrefixRef.current = null;

                if (!pressed.mod && !pressed.alt && !pressed.shift) {
                    const combo = ["g", pressed.key.toLowerCase()];
                    const entry = SHORTCUTS.find(
                        (shortcut) =>
                            shortcut.context === "global" && comboEquals(shortcut.combo, combo)
                    );
                    if (entry && actionsRef.current.has(entry.id)) {
                        event.preventDefault();
                        actionsRef.current.get(entry.id)?.();
                    }
                }
                return;
            }

            if (
                !pressed.mod &&
                !pressed.alt &&
                !pressed.shift &&
                pressed.key.toLowerCase() === "g"
            ) {
                pendingPrefixRef.current = "g";
                pendingTimeoutRef.current = setTimeout(() => {
                    pendingPrefixRef.current = null;
                    pendingTimeoutRef.current = null;
                }, 1000);
                event.preventDefault();
                return;
            }

            for (const shortcut of SHORTCUTS) {
                if (shortcut.context !== "global" && shortcut.context !== currentContext) {
                    continue;
                }
                if (!actionsRef.current.has(shortcut.id)) continue;
                if (comboMatches(shortcut.combo, pressed)) {
                    event.preventDefault();
                    actionsRef.current.get(shortcut.id)?.();
                    return;
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isPaletteOpen, currentContext]);

    const value = React.useMemo<ShortcutsContextValue>(
        () => ({
            activeShortcuts,
            currentContext,
            registerAction,
            unregisterAction,
            runShortcut,
        }),
        [activeShortcuts, currentContext, registerAction, unregisterAction, runShortcut]
    );

    return (
        <ShortcutsContext.Provider value={value}>
            {children}
            <ShortcutPalette
                open={isPaletteOpen}
                onOpenChange={setIsPaletteOpen}
                shortcuts={activeShortcuts}
                currentContext={currentContext}
                onRun={runShortcut}
            />
        </ShortcutsContext.Provider>
    );
}

export function useShortcuts(): ShortcutsContextValue {
    const context = React.useContext(ShortcutsContext);
    if (!context) {
        throw new Error("useShortcuts must be used within a ShortcutsProvider");
    }
    return context;
}

export function useShortcutAction(id: string, action: (() => void) | null) {
    const { registerAction, unregisterAction } = useShortcuts();
    const actionRef = React.useRef(action);
    actionRef.current = action;

    React.useEffect(() => {
        if (!actionRef.current) return;
        registerAction(id, () => actionRef.current?.());
        return () => unregisterAction(id);
    }, [id, registerAction, unregisterAction]);
}

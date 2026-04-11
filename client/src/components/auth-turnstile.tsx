"use client";

import config from "@/config/env";
import React from "react";
import Script from "next/script";
import { cn } from "@/lib/utils";

interface TurnstileWidgetProps {
    onTokenChange: (token: string) => void;
    className?: string;
    label?: string;
    description?: string;
}

interface TurnstileApi {
    render: (
        container: string | HTMLElement,
        options: {
            sitekey: string;
            theme?: "auto" | "light" | "dark";
            size?: "normal" | "compact" | "flexible";
            appearance?: "always" | "execute" | "interaction-only";
            callback?: (token: string) => void;
            "expired-callback"?: () => void;
            "error-callback"?: () => void;
        }
    ) => string;
    remove: (widgetId: string) => void;
}

declare global {
    interface Window {
        turnstile?: TurnstileApi;
    }
}

const turnstileScriptURL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export function AuthTurnstile({
    onTokenChange,
    className,
    label = "Let\'s confirm you\'re human",
    description = "Complete this step to continue securely.",
}: TurnstileWidgetProps) {
    const widgetRef = React.useRef<HTMLDivElement | null>(null);
    const widgetIDRef = React.useRef<string | null>(null);
    const [renderError, setRenderError] = React.useState<string | null>(null);

    const siteKey = config.PUBLIC_TURNSTILE_SITE_KEY;

    const renderWidget = React.useCallback(() => {
        if (typeof window === "undefined" || !window.turnstile || !widgetRef.current) {
            return false;
        }

        if (widgetIDRef.current) {
            return true;
        }

        try {
            widgetIDRef.current = window.turnstile.render(widgetRef.current, {
                sitekey: siteKey,
                theme: "auto",
                size: "normal",
                appearance: "always",
                callback: (token: string) => {
                    setRenderError(null);
                    onTokenChange(token);
                },
                "expired-callback": () => onTokenChange(""),
                "error-callback": () => {
                    onTokenChange("");
                    setRenderError("Security challenge failed. Please refresh and try again.");
                },
            });

            return true;
        } catch {
            setRenderError(
                "Unable to load Turnstile challenge. Check Cloudflare widget mode and domain allowlist."
            );
            return false;
        }
    }, [onTokenChange, siteKey]);

    React.useEffect(() => {
        if (!siteKey) {
            return;
        }

        if (renderWidget()) {
            return;
        }

        const intervalID = window.setInterval(() => {
            if (renderWidget()) {
                window.clearInterval(intervalID);
            }
        }, 150);

        return () => window.clearInterval(intervalID);
    }, [renderWidget, siteKey]);

    React.useEffect(() => {
        return () => {
            if (window.turnstile && widgetIDRef.current) {
                window.turnstile.remove(widgetIDRef.current);
                widgetIDRef.current = null;
            }
        };
    }, []);

    if (!siteKey) {
        return (
            <p className="text-sm text-destructive">
                Turnstile is not configured. Please set NEXT_PUBLIC_TURNSTILE_SITE_KEY.
            </p>
        );
    }

    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{label}</p>
                <span className="text-xs text-muted-foreground">Required</span>
            </div>
            <Script
                id="cloudflare-turnstile"
                src={turnstileScriptURL}
                strategy="afterInteractive"
                onReady={() => {
                    renderWidget();
                }}
            />
            <div className="rounded-lg border bg-muted/20 p-2">
                <div
                    ref={widgetRef}
                    className="flex min-h-[65px] items-center justify-center overflow-hidden"
                />
            </div>
            {renderError ? (
                <p className="text-sm text-destructive">{renderError}</p>
            ) : (
                <p className="text-xs text-muted-foreground">{description}</p>
            )}
        </div>
    );
}

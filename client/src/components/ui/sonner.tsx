"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
    CircleCheckIcon,
    InfoIcon,
    TriangleAlertIcon,
    OctagonXIcon,
    Loader2Icon,
} from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = "system" } = useTheme();

    return (
        <Sonner
            theme={theme as ToasterProps["theme"]}
            className="toaster group"
            position="bottom-right"
            gap={8}
            icons={{
                success: <CircleCheckIcon className="size-[18px]" />,
                info: <InfoIcon className="size-[18px]" />,
                warning: <TriangleAlertIcon className="size-[18px]" />,
                error: <OctagonXIcon className="size-[18px]" />,
                loading: <Loader2Icon className="size-[18px] animate-spin" />,
            }}
            style={
                {
                    "--normal-bg": "var(--popover)",
                    "--normal-text": "var(--popover-foreground)",
                    "--normal-border": "var(--border)",
                    "--border-radius": "calc(var(--radius) + 2px)",
                } as React.CSSProperties
            }
            toastOptions={{
                classNames: {
                    toast: "cn-toast !shadow-lg !border !px-4 !py-3 !gap-3 !items-start",
                    title: "!font-semibold !text-[13.5px] !leading-snug",
                    description: "!text-[12.5px] !opacity-75 !leading-relaxed",
                    actionButton: "!bg-primary !text-primary-foreground !rounded-md !text-xs !font-medium !px-3 !py-1.5",
                    cancelButton: "!bg-muted !text-muted-foreground !rounded-md !text-xs !font-medium !px-3 !py-1.5",
                    closeButton: "!border-none !bg-transparent !text-foreground/50 hover:!text-foreground !transition-colors",
                    icon: "!mt-0.5",
                },
            }}
            {...props}
        />
    );
};

export { Toaster };

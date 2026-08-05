"use client";

import * as React from "react";

import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandShortcut,
} from "@/components/ui/command";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
    SHORTCUT_CONTEXT_LABELS,
    type ShortcutContext,
    type ShortcutDefinition,
} from "@/constants/shortcuts";
import { partLabel } from "@/hooks/use-hotkey";

interface ShortcutPaletteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    shortcuts: ShortcutDefinition[];
    currentContext: ShortcutContext;
    onRun: (id: string) => void;
}

function ShortcutKeys({ combo }: { combo: string[] }) {
    const sequence =
        combo.length > 1 &&
        !combo.includes("mod") &&
        !combo.includes("shift") &&
        !combo.includes("alt");

    return (
        <KbdGroup>
            {combo.map((part, index) => (
                <React.Fragment key={`${part}-${index}`}>
                    {index > 0 && (
                        <span className="text-muted-foreground">{sequence ? "then" : "+"}</span>
                    )}
                    <Kbd>{partLabel(part)}</Kbd>
                </React.Fragment>
            ))}
        </KbdGroup>
    );
}

export function ShortcutPalette({
    open,
    onOpenChange,
    shortcuts,
    currentContext,
    onRun,
}: ShortcutPaletteProps) {
    const contextOrder = currentContext === "global" ? ["global"] : [currentContext, "global"];

    const groups = contextOrder
        .map((context) => ({
            context,
            label: SHORTCUT_CONTEXT_LABELS[context as ShortcutContext],
            items: shortcuts.filter((shortcut) => shortcut.context === context),
        }))
        .filter((group) => group.items.length > 0);

    return (
        <CommandDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Keyboard Shortcuts"
            description="Search and run keyboard shortcuts"
        >
            <Command>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No shortcuts found.</CommandEmpty>
                    {groups.map((group) => (
                        <CommandGroup key={group.context} heading={group.label}>
                            {group.items.map((shortcut) => (
                                <CommandItem
                                    key={shortcut.id}
                                    value={`${shortcut.name} ${shortcut.keywords ?? ""}`}
                                    onSelect={() => onRun(shortcut.id)}
                                >
                                    <span>{shortcut.name}</span>
                                    <CommandShortcut>
                                        <ShortcutKeys combo={shortcut.combo} />
                                    </CommandShortcut>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    ))}
                </CommandList>
                <div className="flex items-center gap-4 border-t p-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Kbd>?</Kbd>
                        toggle
                    </span>
                    <span className="flex items-center gap-1">
                        <Kbd>↑↓</Kbd>
                        navigate
                    </span>
                    <span className="flex items-center gap-1">
                        <Kbd>↵</Kbd>
                        select
                    </span>
                    <span className="flex items-center gap-1">
                        <Kbd>Esc</Kbd>
                        close
                    </span>
                </div>
            </Command>
        </CommandDialog>
    );
}

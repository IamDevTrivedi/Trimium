import * as React from "react";

export interface PressedKey {
    key: string;
    mod: boolean;
    shift: boolean;
    alt: boolean;
}

const isMac: boolean =
    typeof navigator !== "undefined" && navigator.platform.toUpperCase().includes("MAC");

export function parseKey(event: KeyboardEvent): PressedKey {
    return {
        key: event.key,
        mod: event.ctrlKey || event.metaKey,
        shift: event.shiftKey,
        alt: event.altKey,
    };
}

export function isSequenceCombo(combo: string[]): boolean {
    return (
        combo.length > 1 &&
        !combo.includes("mod") &&
        !combo.includes("shift") &&
        !combo.includes("alt")
    );
}

export function comboMatches(combo: string[], pressed: PressedKey): boolean {
    if (isSequenceCombo(combo)) {
        return false;
    }

    const hasMod = combo.includes("mod");
    const hasShift = combo.includes("shift");
    const hasAlt = combo.includes("alt");

    if (pressed.mod !== hasMod) return false;
    if (pressed.shift !== hasShift) return false;
    if (pressed.alt !== hasAlt) return false;

    const keyToken = combo[combo.length - 1];
    return pressed.key.toLowerCase() === keyToken.toLowerCase();
}

export function comboEquals(left: string[], right: string[]): boolean {
    return (
        left.length === right.length &&
        left.every((part, index) => part.toLowerCase() === right[index].toLowerCase())
    );
}

export function isTypingTarget(target: Element | null): boolean {
    if (!target) return false;
    if (target instanceof HTMLElement && target.isContentEditable) return true;

    const tag = target.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

export function partLabel(part: string): string {
    if (part === "mod") return isMac ? "⌘" : "Ctrl";
    if (part === "shift") return "Shift";
    if (part === "alt") return "Alt";
    return part.toUpperCase();
}

export function comboLabel(combo: string[]): string {
    const parts = combo.map(partLabel);
    return isSequenceCombo(combo) ? parts.join(" then ") : parts.join(" + ");
}

export function useHotkey(combo: string[], handler: () => void, enabled: boolean = true) {
    const handlerRef = React.useRef(handler);
    handlerRef.current = handler;

    React.useEffect(() => {
        if (!enabled) return;
        if (isSequenceCombo(combo)) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (isTypingTarget(document.activeElement)) return;
            if (comboMatches(combo, parseKey(event))) {
                event.preventDefault();
                handlerRef.current();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [combo.join(","), enabled]);
}

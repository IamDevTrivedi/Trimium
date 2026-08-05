# Keyboard Shortcuts & Shortcut Palette — Design

Date: 2026-08-05
Status: Implemented

## Summary

Add a context-aware keyboard shortcut system to the Trimium client. Pressing
`Shift + ?` (or `Ctrl/Cmd + K`) opens a searchable command palette that lists
all shortcuts valid for the current page; selecting an entry runs its action.
The palette doubles as a live shortcut reference.

## Requirements

- `Shift + ?` / `Cmd/Ctrl + K` toggles the shortcut palette.
- The palette is an interactive, searchable list of actions (cmdk) that runs
  actions on select, and shows each action's keycaps as `Kbd` hints.
- Shortcuts are context-aware: only shortcuts relevant to the current page are
  active and displayed.
- Shortcuts must not fire while the user is typing in an input/textarea/select/
  contenteditable, except for a small allowlist (`Shift + ?`, `Cmd/Ctrl + K`,
  `Cmd/Ctrl + S`).
- Fixed shortcut map (no user rebinding). Registry is the single source of truth
  for both handlers and palette display.

## Shortcut Map

### Global

| Shortcut       | Action                  |
| -------------- | ----------------------- |
| `Shift + ?`    | Toggle shortcut palette |
| `Cmd/Ctrl + K` | Toggle shortcut palette |
| `t`            | Toggle theme            |
| `g` `h`        | Go to Home              |
| `g` `w`        | Go to Workspaces        |
| `g` `a`        | Go to Account           |
| `g` `l`        | Go to Login Activity    |
| `g` `q`        | Go to QR Generator      |
| `g` `e`        | Go to Linkhub Editor    |
| `g` `f`        | Go to Features          |

### Workspace detail — `/w/[workspaceID]`

| Shortcut | Action          |
| -------- | --------------- |
| `n`      | New short link  |
| `b`      | Bulk upload     |
| `s`      | Tags & settings |

### Workspace list — `/w`

| Shortcut | Action        |
| -------- | ------------- |
| `n`      | New workspace |

### Short link detail — `/w/[workspaceID]/[shortCode]`

| Shortcut | Action            |
| -------- | ----------------- |
| `e`      | Edit short link   |
| `y`      | Copy short URL    |
| `c`      | Copy original URL |

### Forms (create-url, edit, create-workspace)

| Shortcut       | Action        |
| -------------- | ------------- |
| `Cmd/Ctrl + S` | Save & submit |

### QR generator — `/qr-generator`

| Shortcut       | Action            |
| -------------- | ----------------- |
| `Cmd/Ctrl + S` | Download QR (PNG) |

## Architecture

Single source of truth: a declarative registry drives both the palette display
and the actual key handling.

```
client/src/constants/shortcuts.ts            # Registry + types + context labels
client/src/hooks/use-hotkey.ts               # Combo parsing, matching, input-ignore utilities
client/src/components/shortcut-palette.tsx   # CommandDialog UI (search + keycaps)
client/src/components/shortcuts-provider.tsx # Global listener, context detection, action registry
client/src/app/layout.tsx                    # Mount provider inside ThemeProvider
```

### Registry — `constants/shortcuts.ts`

`ShortcutDefinition = { id, name, combo: string[], context, keywords? }`.
Combo tokens: `mod` (Ctrl/Cmd), `shift`, `alt`, or a key. Multi-token combos
without modifiers are treated as sequences (`["g","w"]` → press `g` then `w`).
`context` ∈ `global | workspace | workspace-list | shortlink | form | qr`.

### Provider — `components/shortcuts-provider.tsx`

- Derives `currentContext` from `usePathname()`.
- Holds an action map keyed by shortcut id. Global actions (theme, navigation)
  are registered internally. Page-level actions register via
  `useShortcutAction(id, action)`.
- One global `keydown` listener:
    1. Toggle combos first (works even while typing).
    2. When palette is open, ignore everything else.
    3. Skip single-letter/sequence shortcuts while typing (allowlist `mod+s`).
    4. Resolve pending `g`-prefix sequence (1s timeout, aborts on invalid key).
    5. Arm `g` prefix on bare `g`.
    6. Chord match against relevant, registered shortcuts; `preventDefault` + run.
- Computes `activeShortcuts` = registry entries whose context matches the
  current page AND whose action is currently registered (so the palette only
  shows runnable shortcuts).

### Palette — `components/shortcut-palette.tsx`

- `CommandDialog` (cmdk) with `CommandInput` search, `CommandGroup` per context,
  `CommandItem` rows, `CommandShortcut` + `KbdGroup`/`Kbd` keycaps, footer hints.
- `value` includes name + keywords for search. Selecting an item calls
  `onRun(id)`, which closes the palette and invokes the action.

## Page Wiring

| Component                   | Registered action                           |
| --------------------------- | ------------------------------------------- |
| `shortcode-performance.tsx` | `copy-short-url`, `copy-original-url`       |
| `create-redirect-form.tsx`  | `save-form`                                 |
| `edit-redirect-form.tsx`    | `save-form`                                 |
| `create-workspace-form.tsx` | `save-form`                                 |
| `custom-qr-generator.tsx`   | `download-qr`                               |
| `workspace-details.tsx`     | `id="workspace-tags"` scroll target for `s` |

## Edge Cases

- Typing protection: `isTypingTarget()` skips single-letter and `g`-sequence
  combos; `Shift + ?`, `Cmd/Ctrl + K`, `Cmd/Ctrl + S` always work.
- `g` sequence: 1s timeout; invalid follow-up key aborts the sequence.
- Palette open: all shortcuts suppressed except toggles.
- `mod+s` calls `preventDefault()` when a registered save action runs, avoiding
  the browser save dialog on form pages.
- SSR safe: all logic runs in event handlers / `useEffect`.

## Verification

- `pnpm run lint`
- `pnpm run format:check`
- Client production build (`pnpm build`) — type-checks all new files.
- Manual: open palette, run `g`-nav, confirm form inputs are not hijacked,
  toggle theme, copy short URL, save with `Cmd/Ctrl + S`, download QR.

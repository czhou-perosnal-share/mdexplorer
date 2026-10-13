## Context

The sidebar's folder tree is populated by `handleRefresh` → `window.api.scanFolder` → IPC → `fs.readdirSync`. This call already exists and is invoked when a folder is first opened and when the MD-only/Full toggle changes. There is no polling, no `fs.watch`, and no user-initiated rescan path. The refresh button reuses the same scan path with zero new IPC.

## Goals / Non-Goals

**Goals:**
- Single button in the Files header row that rescans the open folder on demand
- `F5` keyboard shortcut as an alternative trigger
- Button disabled when no folder is open
- Consistent Nocturne ghost-button style matching the existing MD-only toggle

**Non-Goals:**
- Automatic/live filesystem watching (`fs.watch` or chokidar) — too complex and out of scope
- Persisting refresh state or timestamp
- Refreshing open file content (tab contents are not re-read on refresh)

## Decisions

### 1 — Reuse `loadFolder` directly, no new IPC

`App.tsx` already has `loadFolder(rootFolder, treeMode)` which calls `scanFolder` and updates `tree` state. The refresh button calls this same function. No new IPC handler, no changes to `src/main/index.ts` or `src/preload/index.ts`.

### 2 — Place button in the Files header row

The Files header row (`tree-files-header`) already contains the MD-only/All-files toggle on the right. The refresh button sits to the left of that toggle, keeping all tree controls in one row. Alternative (toolbar) would scatter file-tree controls across the UI.

### 3 — `F5` via `keydown` on `window` in `App.tsx`

`F5` is the universal browser/app refresh shortcut. Attaching it to `window` (same pattern as `Ctrl+Shift+E` for the tab switcher) means it works regardless of focus. Guard: only fires when `rootFolder` is non-empty.

### 4 — SVG refresh icon, no label

Matches the Nocturne icon-forward aesthetic (same approach as the tab-switcher button). A circular arrow SVG is universally understood and keeps the header row compact. Tooltip text "Refresh folder (F5)" provides discoverability.

### 5 — Single `isTreeLoading` state drives both button spinner and overlay

Both the refresh button and the MD-only/All-files toggle trigger a `scanFolder` call. A single boolean `isTreeLoading` (replacing the narrower `isRefreshing`) covers both code paths:
- `handleRefresh`: sets `isTreeLoading = true` before `loadFolder`, `false` after
- `handleTreeModeToggle`: same wrapping

The button spinner and the tree overlay both read from `isTreeLoading`, so they are always in sync. The overlay is a `position: absolute` div inside the sidebar panel, rendered conditionally when `isTreeLoading` is true.

## Risks / Trade-offs

- **[Risk] Large folders rescan slowly** → Mitigation: brief spinner state (`isRefreshing`) on the button during the async rescan; button disabled while in progress to prevent double-clicks.
- **[Risk] Open tabs reference files that no longer exist after refresh** → Out of scope for this change — stale tab behavior already exists today and is a separate concern.

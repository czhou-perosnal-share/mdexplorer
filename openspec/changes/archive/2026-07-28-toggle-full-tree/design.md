## Context

The current folder tree component (`FolderTree.tsx`) is built on a `FileTree` node structure returned by the `scan-folder` IPC handler in `main.ts`. That handler currently filters all non-`.md` files and prunes directories with no Markdown descendants. The renderer never sees non-MD files.

The tree mode toggle requires either:
1. Scanning two separate data sets (one filtered, one full), or
2. Scanning once for all files and filtering client-side.

## Goals / Non-Goals

**Goals:**
- Toggle control that switches tree view between MD-only and full folder structure
- Full mode shows all files/dirs; non-MD files are visually distinct
- Double-click on non-MD file opens it via OS default (`shell.openPath`)
- Toggle state persisted in session state

**Non-Goals:**
- Searching or filtering within Full mode by file type
- Drag-and-drop or file management (rename, delete, move)
- Opening non-MD files in an embedded viewer

## Decisions

### Decision: Single scan returning all files; filter client-side

**Chosen:** Add a new `scan-folder-full` IPC handler (or a `mode` param to the existing one) that returns the complete tree with all files. The renderer holds both the full tree and the filtered-MD tree (or recomputes the filter), controlled by a `treeMode` state value.

**Alternative considered:** Keep filtering in main process, add a second IPC call when switching modes. Rejected because it adds latency on every toggle and requires a second round-trip.

**Why chosen:** The folder scan result is small enough to hold in memory. A single scan on folder load, with client-side filtering, makes toggling instant with no IPC overhead.

**Implementation detail:** Extend the `scan-folder` handler to accept a `{ mode: 'md-only' | 'full' }` option. When `full`, skip the Markdown-only filter and return all files. Store the full tree in App state; derive the MD-only filtered tree with a pure function when needed.

### Decision: Double-click for non-MD files, single-click for MD files

**Chosen:** Single-click on `.md` files opens them in the viewer (existing behavior). Non-MD files require a double-click to open externally. Single-click on a non-MD file selects/focuses the item only.

**Alternative considered:** Single-click to open non-MD files externally. Rejected — accidental clicks would constantly launch external apps.

### Decision: `shell.openPath` via a dedicated IPC channel

**Chosen:** Add `open-path` IPC handler in main process using `shell.openPath(absolutePath)`. Expose it as `window.api.openPath(path)` in the preload bridge.

**Why:** `shell` is only available in the main process; it cannot be called directly from the renderer. This pattern is consistent with the existing IPC architecture.

### Decision: Persist `treeMode` in existing session state store

**Chosen:** Add `treeMode: 'md-only' | 'full'` to `AppState` in `store.ts`. Default: `'md-only'` (preserves existing behavior on first launch).

## Risks / Trade-offs

- [Large folders] Full mode could show thousands of files, making the tree slow to render → Mitigation: the existing virtualisation-less tree already handles reasonably-sized folders; very large trees are a pre-existing concern outside this change's scope.
- [shell.openPath on Windows] May silently fail if no default app is registered → Mitigation: `shell.openPath` returns an error string on failure; surface it as a brief status bar message.

## Open Questions

- Should the toggle label be a text button ("Show All" / "MD Only") or an icon toggle? Leaning toward a small labeled button for discoverability.

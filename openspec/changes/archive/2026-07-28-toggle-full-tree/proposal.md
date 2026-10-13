## Why

The current folder tree only shows `.md` files, which hides the true folder structure. Users familiar with the original folder layout can get disoriented because non-Markdown files and empty directories are invisible. Additionally, there is no way to open non-Markdown files from within the app — users must leave the app and navigate the OS file system separately.

## What Changes

- Add a toggle control (button or checkbox) in the tree panel header to switch between **MD-only mode** (current behavior) and **Full mode** (all files and folders shown).
- In Full mode, the tree displays the complete folder structure: all file types and all directories, identical to how the OS file explorer would show it.
- Non-Markdown files in Full mode are visually distinct (dimmed or different icon) so `.md` files remain easy to spot.
- Single-clicking a non-Markdown file in Full mode does nothing (or shows a tooltip).
- Double-clicking a non-Markdown file in Full mode opens it with the OS default program (`shell.openPath`).
- The toggle state is persisted in session state so it survives app restarts.

## Capabilities

### New Capabilities
- `full-tree-toggle`: Toggle between MD-only and full folder tree display modes, with double-click-to-open for non-Markdown files using the OS default application.

### Modified Capabilities
- `folder-tree`: The "Filter tree to Markdown files only" requirement becomes conditional — it applies in MD-only mode but not in Full mode.

## Impact

- `src/main.ts` — add `open-path` IPC handler using Electron's `shell.openPath`
- `src/preload.ts` — expose `openPath` on `window.api`
- `src/renderer/types/api.d.ts` — type the new `openPath` method
- `src/main/store.ts` — add `treeMode: 'md-only' | 'full'` to session state schema
- `src/renderer/components/FolderTree.tsx` — accept `mode` prop; show/hide non-MD nodes; handle double-click
- `src/renderer/App.tsx` — thread `treeMode` state through; add toggle UI
- `src/index.css` — styles for non-MD file items and the toggle control

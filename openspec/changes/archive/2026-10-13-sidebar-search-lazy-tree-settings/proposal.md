## Why

Opening a very large folder froze the UI because the whole tree was scanned synchronously in the Electron main process, and the app auto-reopened the last folder with no way to avoid it. The window could also be restored off-screen after a monitor was disconnected. Navigation (filter box, theme select) was cramped into the tree panel, the app chrome could not be themed, and clicking a link inside a document could navigate the app window away.

## What Changes

- Restore the saved window position only if it is still visible on a connected display; otherwise center on the primary display. Do not save bounds while minimized, maximized or fullscreen.
- On launch, ask whether to reopen the previous folder or choose another instead of scanning it automatically. Folders passed via CLI or the menu skip the prompt.
- All folder listing, file reading and searching run asynchronously in the main process so the UI never blocks.
- **BREAKING (behavior)**: the folder tree is loaded lazily, one directory level at a time on expand. In MD-only mode every folder is listed (it can no longer be known whether a folder contains Markdown without scanning it); `.git` and `node_modules` are hidden in MD-only mode. The up-front "scan the whole folder" step and its progress dialog are removed.
- Add a VS Code-style activity bar on the left with Explorer, Search and Settings icons; clicking the active view collapses the sidebar.
- Replace the tree "Filter files…" box with a Search view: streaming, cancellable, Markdown-only search by file name with an optional file-contents mode, which keeps running while the user works in the Explorer.
- Add a Settings dialog (File → Settings…, `Ctrl+,`, gear icon) with an interface theme (Nocturne, Light, Graphite, High contrast) and the document theme.
- Handle links inside documents: relative `.md` links open (or activate) a tab without touching the folder tree, external URLs open in the default browser, other local files open with the OS, missing targets report an error, `#anchor` links scroll. Navigating the app window via a link is blocked.
- App name stays **MdExplorer**.

## Capabilities

### New Capabilities
- `window-position`: Safe restoration and saving of window bounds across display changes.
- `startup-folder-prompt`: Prompt to reopen the previous folder or choose another at launch.
- `sidebar-navigation`: Activity bar with Explorer/Search/Settings and a collapsible sidebar.
- `file-search`: Streaming, cancellable, Markdown-only search by name and optionally contents.
- `app-settings`: Settings dialog with interface theme and document theme.
- `document-links`: Behavior of links clicked inside rendered documents, with tab de-duplication.

### Modified Capabilities
- `folder-tree`: Tree is loaded lazily per directory; MD-only mode lists all folders (minus `.git`/`node_modules`) and only `.md` files; no loading overlay on toggle.
- `tree-refresh`: Refresh re-lists the root and all expanded folders and keeps them expanded.

## Impact

- `src/main/index.ts`: async `list-dir`, `search-start`/`search-cancel`, `resolve-link`, `open-external` IPC handlers; window bounds validation; navigation blocking; Settings menu item.
- `src/main/store.ts`: new `uiTheme` state field.
- `src/preload/index.ts`: new API surface (`listDir`, search, link, settings events); `scanFolder` removed.
- `src/renderer`: `App.tsx`, `FolderTree.tsx` (rewritten), new `SearchPanel.tsx`, `MarkdownViewer.tsx` (link handling), `index.css` (UI theme tokens, activity bar, search, dialogs).
- No new dependencies.

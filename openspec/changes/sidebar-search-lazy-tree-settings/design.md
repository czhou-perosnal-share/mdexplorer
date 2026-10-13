## Context

MdExplorer is an Electron + React app. Originally the main process scanned the entire folder synchronously (`readdirSync` recursion) on open and on every refresh/mode toggle, then sent the full tree to the renderer. On a huge folder this blocked the main process (window unresponsive). The last folder was reopened automatically at startup, and window bounds were saved/restored verbatim.

## Goals / Non-Goals

**Goals:**
- UI never blocks regardless of folder size.
- User controls whether a previous (possibly huge) folder is opened.
- VS Code-like navigation model (activity bar, Explorer, Search) with background search.
- Themeable app chrome independent of the document theme.
- Document links behave like a browser/IDE would, without polluting the tree.

**Non-Goals:**
- Regex / case-sensitive / glob search, search-and-replace, or searching non-Markdown files.
- Revealing a search result or linked file in the Explorer tree.
- Scrolling to the `#fragment` of a cross-document link.
- File-system watching for automatic tree updates.
- Renaming the app.

## Decisions

- **Lazy tree via per-directory IPC (`list-dir`)** rather than a full async scan with progress. A full scan still costs time and memory on huge trees; listing one level is O(entries in that folder). The renderer caches children per absolute path and a refresh re-lists the root plus all expanded folders. Trade-off: MD-only mode can no longer hide folders with no Markdown (unknown without scanning), so all folders are shown except `.git`/`node_modules`.
- **Async `fs.promises` everywhere in main** (list, read, search). Every `await` yields to the event loop so IPC and window events stay responsive; no worker thread was needed.
- **Search in the main process, streamed over IPC.** `search-start` returns immediately; hits are sent in batches (≤50 or every 100 ms) via `search-hits`, completion via `search-done`. Starting a new search or `search-cancel` flags running jobs cancelled. Limits: 2000 hits, 2 MB per file for content search. Search is hard-wired to Markdown files (`.md`) regardless of tree mode. The Search view stays mounted when hidden so results and the running job persist while the Explorer is shown.
- **Sidebar as a collapsible `react-resizable-panels` Panel** controlled by `usePanelRef().collapse()/expand()`; both views are rendered and toggled with `hidden`. Alternative of conditionally mounting the panel was rejected to avoid the library's dynamic-panel layout handling.
- **Startup prompt instead of auto-scan.** Persisted `lastFolder` is only offered; "Open previous" also restores tabs. CLI and menu folders bypass it (`folderLoaded` guard handles the race).
- **UI themes as CSS custom-property overrides** keyed by `<html data-ui-theme>`. Hard-coded overlay/shadow/selection/warning colors were converted to tokens (`--color-scrim`, `--color-shadow`, `--color-selected-bg`, `--color-warn`, `--color-loading-veil`) so light and high-contrast themes work. Document themes remain separate (`#theme-style`). `uiTheme` is persisted in the electron-store state.
- **Link resolution in the main process (`resolve-link`)** using Node `path`/`fs`: relative to the current file, leading `/` relative to the opened folder, `file:` URLs, extensionless fallback to `.md`. `realpath.native` yields canonical casing so one file maps to one path. The renderer additionally compares paths case-insensitively on Windows and updates a synchronous `tabsRef` so rapid repeat clicks cannot create duplicate tabs. Only `http(s):` and `mailto:` are passed to `shell.openExternal`.
- **Navigation hardening:** `setWindowOpenHandler` denies, `will-navigate` is prevented, and the viewer calls `preventDefault` on every link click.
- **Window bounds:** saved bounds are used for position only if they overlap a display work area by at least 100×50 px; size is always restored. Bounds are not persisted while minimized/maximized/fullscreen (a minimized window reports ~-32000 coordinates).

## Risks / Trade-offs

- [MD-only mode shows folders without Markdown] → accepted trade-off of lazy loading; `.git`/`node_modules` hidden to reduce noise.
- [Very large single directories still return all entries in one IPC call] → acceptable; only one level at a time.
- [Content search reads many files on huge trees] → async, cancellable, capped by hit count and file size; user can stop it.
- [Search only matches plain, case-insensitive substrings] → documented non-goal.
- [Cross-document link fragments ignored] → documented non-goal.
- [Stale persisted `windowBounds` from older builds] → handled by the visibility check on every launch.

## 1. Project Scaffold

- [x] 1.1 Scaffold with `electron-forge` Vite + React + TypeScript template: `npm init electron-app@latest mdexplorer -- --template=vite-typescript`
- [x] 1.2 Add dependencies: `marked`, `highlight.js`, `electron-store`, `react-resizable-panels`; add dev deps: `@types/marked`, `@types/highlight.js`
- [x] 1.3 Configure `electron-builder` in `package.json` for Windows (NSIS), macOS (DMG), and Linux (AppImage) targets
- [x] 1.4 Set up `contextIsolation: true` + `nodeIntegration: false` in `BrowserWindow`; create preload script exposing IPC bridge via `contextBridge`

## 2. Main Process — IPC and Window

- [x] 2.1 Implement `scan-folder` IPC handler: recursively scan a directory, return a nested tree of `.md` files (filter out dirs with no `.md` descendants)
- [x] 2.2 Implement `read-file` IPC handler: read file content by absolute path, return string; truncate to 10,000 lines if over limit and set a flag
- [x] 2.3 Implement `open-folder-dialog` IPC handler: open native folder picker, return selected path
- [x] 2.4 Parse CLI argument (`process.argv` in main process): if a valid folder path is passed, send it to renderer after window is ready
- [x] 2.5 Persist and restore `windowBounds` via `electron-store` on window `resize`/`move` and `ready-to-show`

## 3. Session State

- [x] 3.1 Create `src/main/store.ts`: initialize `electron-store` with typed schema (`lastFolder`, `openTabs`, `activeTab`, `scrollPositions`, `theme`, `windowBounds`)
- [x] 3.2 Expose `get-state` and `set-state` IPC handlers; renderer reads/writes state only through these
- [x] 3.3 Handle schema migration: if stored state has missing keys, fill with defaults without crashing

## 4. Preload Bridge

- [x] 4.1 Implement `preload.ts` exposing `window.api`: `scanFolder`, `readFile`, `openFolderDialog`, `getState`, `setState`, `onFolderFromCLI`
- [x] 4.2 Type the bridge in `src/renderer/types/api.d.ts` so renderer TypeScript can call it with full type safety

## 5. Folder Tree Component

- [x] 5.1 Create `FolderTree` React component: accepts a `FileTree` node prop and renders a recursive expand/collapse tree
- [x] 5.2 Implement expand/collapse state (default: all top-level dirs expanded); toggle on click or `Enter`
- [x] 5.3 Emit `onFileSelect(relativePath: string)` callback when a file node is clicked or activated with `Enter`/`↓`/`↑`
- [x] 5.4 Show "No Markdown files found" empty state when tree is empty
- [x] 5.5 Add "Open Folder" button at the top of the tree panel that calls `window.api.openFolderDialog`

## 6. Markdown Rendering Pipeline

- [x] 6.1 Create `src/renderer/lib/renderMarkdown.ts`: configure `marked` with GFM + `highlight.js` renderer hook; return sanitized HTML string
- [x] 6.2 Configure `marked`'s `highlight` option to call `highlight.js.highlightAuto` for fenced code blocks
- [x] 6.3 Strip or escape `<script>` tags and `on*` attributes from output HTML before injection (defense-in-depth, alongside CSP)
- [x] 6.4 If file is truncated (>10,000 lines), prepend a warning banner `<div class="truncation-warning">…</div>` to the HTML

## 7. Markdown Viewer Component

- [x] 7.1 Create `MarkdownViewer` React component: renders HTML from `renderMarkdown()` via `dangerouslySetInnerHTML` in a scrollable `<div>`
- [x] 7.2 Expose scroll position as a state value; call `onScrollChange(px: number)` prop on scroll (debounced 500 ms) for state persistence
- [x] 7.3 On `loadFile`, restore saved scroll position from session state after render (`scrollTo`)
- [x] 7.4 Implement keyboard scroll handlers: `↑`/`↓` (40 px), `PgUp`/`PgDn` (viewport height), `Home`/`End`
- [x] 7.5 Show status bar below viewer: relative path + line count

## 8. Tab Bar Component

- [x] 8.1 Create `TabBar` React component: renders a horizontal list of tabs with filename labels, close (×) buttons, and active state styling
- [x] 8.2 Implement `openTab(relativePath)`: if already open, activate existing tab; otherwise add new tab and activate it
- [x] 8.3 Implement `closeTab(relativePath)`: remove tab, activate next/previous tab; show empty state if last tab closed
- [x] 8.4 Handle `Ctrl+W` (close active tab) and `Ctrl+Tab` / `Ctrl+Shift+Tab` (cycle tabs) via `keydown` listener
- [x] 8.5 Add tooltip (`title` attribute) on each tab showing full relative path

## 9. Viewer Themes

- [x] 9.1 Create four CSS theme files in `src/renderer/themes/`: `github.css`, `nord.css`, `dracula.css`, `plain.css` — each sets CSS custom properties (`--md-bg`, `--md-text`, `--md-heading-color`, `--md-code-bg`, `--md-link`, etc.)
- [x] 9.2 Pair each theme with a `highlight.js` stylesheet (import the matching hljs CDN CSS or bundle it)
- [x] 9.3 Implement `applyTheme(name: string)`: swap the active theme `<link>` element in the renderer `<head>`
- [x] 9.4 Add theme submenu to the native `Menu` (main process) with `click` handlers that send `set-theme` IPC to renderer
- [x] 9.5 Add a theme `<select>` dropdown in the toolbar (renderer); synced with native menu selection
- [x] 9.6 Load saved theme from session state on startup; default to `github`

## 10. App Shell Layout

- [x] 10.1 Compose root layout in `App.tsx`: `react-resizable-panels` `PanelGroup` with `FolderTree` panel (default 30%) + `TabBar`/`MarkdownViewer` panel (default 70%)
- [x] 10.2 Add a toolbar row above the panels: folder path label, "Open Folder" button, theme dropdown
- [x] 10.3 Add a status bar row below the panels: active file relative path + line count
- [x] 10.4 Implement "Open Folder" flow: call `openFolderDialog`, scan folder, update tree + session state
- [x] 10.5 Wire `Ctrl+Q` / `Cmd+Q` to `window.close()`; add "File > Open Folder" and "File > Quit" to native menu

## 11. Session Restore on Launch

- [x] 11.1 On renderer mount: read session state, scan last folder, restore open tabs (skip files that no longer exist)
- [x] 11.2 After tabs render: restore scroll positions per file
- [x] 11.3 Activate the last active tab; fall back to first available tab if it no longer exists
- [x] 11.4 Persist state on: tab open, tab close, tab switch, scroll change (debounced), theme change, folder change

## 12. Packaging and Distribution

- [x] 12.1 Configure `electron-builder` `appId`, `productName`, icon assets (`.ico` for Windows, `.icns` for macOS, `.png` for Linux)
- [ ] 12.2 Verify `npm run make` produces installable artifacts on Windows
- [x] 12.3 Add `README.md` with install instructions and keyboard shortcuts reference

## 13. Tests

- [x] 13.1 Unit tests for `renderMarkdown`: heading output, code block with highlight, XSS script tag stripped, truncation flag
- [x] 13.2 Unit tests for `openTab` deduplication logic and `closeTab` last-tab empty state
- [x] 13.3 Unit tests for session store: schema defaults, missing key migration
- [ ] 13.4 Smoke test (Playwright + Electron): launch app with a temp folder, verify tree lists `.md` files, click a file, verify content renders

## 14. Frontmatter Rendering

- [x] 14.1 In `renderMarkdown.ts`, detect and extract a leading YAML frontmatter block using the regex `/^---\r?\n([\s\S]*?)\r?\n---(\r?\n|$)/` before passing the remaining content to `marked`
- [x] 14.2 Parse the extracted frontmatter string into key-value pairs: split on newlines, then split each line on the first `: ` — preserve colons within values; render unknown/nested values as their raw string
- [x] 14.3 Build a `<table class="frontmatter-table">` HTML snippet from the parsed pairs (header row: Key / Value; one row per pair) and prepend it to the rendered HTML output
- [x] 14.4 Add `.frontmatter-table` CSS rules to `src/index.css` (two-column layout, styled to match the active theme via CSS custom properties); add unit tests covering: file-with-frontmatter produces table HTML, file-without-frontmatter is unaffected, frontmatter with nested values does not throw

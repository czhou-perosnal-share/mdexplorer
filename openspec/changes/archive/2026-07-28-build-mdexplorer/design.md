## Context

`mdexplorer` is a brand-new Electron desktop application with no existing codebase. The goal is a fast, mouse- and keyboard-driven Markdown file browser that installs like any native app, renders Markdown with full fidelity, and persists reading state so users can return to exactly where they left off. The architecture follows the VS Code model: an Electron main process handles OS integration and file system access, and a React + TypeScript renderer process handles all UI.

## Goals / Non-Goals

**Goals:**
- Installable native desktop app (Windows `.exe`, macOS `.dmg`, Linux `.AppImage`/`.deb`)
- Split-pane layout: resizable folder tree (left) + multi-tab Markdown viewer (right)
- Render Markdown with styled headings, code blocks (with syntax highlighting), tables, blockquotes, and inline formatting
- Persist last-viewed file + scroll position per file across sessions
- Allow multiple `.md` files open simultaneously as tabs
- Let users choose a viewer style/theme from a predefined set
- Accept an optional folder path as a CLI argument; default to last-used folder or home dir

**Non-Goals:**
- Editing Markdown (read-only viewer)
- Syncing or fetching remote files
- Rendering HTML, PDF, or non-Markdown file types
- Full Markdown language server / linting
- Mobile or web deployment

## Decisions

### 1. Framework: Electron + React + TypeScript

**Decision:** Build with Electron (main process) + React + TypeScript (renderer process), scaffolded via `electron-forge` with the Vite + React template.

**Rationale:** Electron provides native OS integration (window chrome, file dialogs, tray, packaging) while the renderer runs in a Chromium webview — the same approach VS Code uses. React + TypeScript gives a typed, component-driven UI with a large ecosystem. `electron-forge` handles dev server, hot reload, and packaging in one toolchain.

**Alternatives considered:**
- PyQt6 + QWebEngineView: Python-only but larger Python runtime dependency; weaker TypeScript ecosystem for UI components
- Tauri + React: smaller bundle, but Rust backend adds complexity; webview is OS-native (variable rendering across platforms)
- Python + browser (Flask/FastAPI): no native window; requires a running server process

### 2. Markdown rendering: `marked` + `highlight.js` → HTML in React

**Decision:** Convert Markdown to HTML using `marked` (with GFM enabled) and syntax-highlight code blocks using `highlight.js`. Inject the HTML into a React component via `dangerouslySetInnerHTML` inside a sandboxed `<div>` with Content Security Policy disallowing scripts.

**Rationale:** `marked` is battle-tested, fast, and used by VS Code's own Markdown preview. `highlight.js` covers 190+ languages. Rendering into an HTML div gives full CSS styling control. CSP prevents XSS from untrusted Markdown content.

**Alternatives considered:**
- `markdown-it`: also excellent; `marked` chosen for its smaller bundle and VS Code parity
- Native `QTextBrowser`: only relevant for Qt stack
- iframe sandbox: more isolation but complicates scroll position tracking

### 3. Multi-tab: custom React tab bar component

**Decision:** Implement tabs as a lightweight custom React component (`TabBar` + `TabPanel`) rather than pulling in a third-party tab library.

**Rationale:** The required behavior (open, close, switch, dedup, Ctrl+W, Ctrl+Tab) is simple enough to implement in ~100 lines of React state. Avoids a dependency that may conflict with Electron's Chromium version. Tab titles show filename; tooltip shows full relative path.

**Alternatives considered:**
- `rc-tabs`: feature-rich but adds ~40 kB and has accessibility trade-offs in Electron
- VS Code's tab system: not extractable

### 4. Session state: `electron-store`

**Decision:** Use `electron-store` to persist session state in the main process.

**State schema:**
```ts
{
  lastFolder: string;
  openTabs: string[];          // relative paths
  activeTab: string;
  scrollPositions: Record<string, number>;  // relative path → px offset
  theme: string;
  windowBounds: { x, y, width, height };
}
```

**Rationale:** `electron-store` handles cross-platform paths (`%APPDATA%` on Windows, `~/Library/Application Support` on macOS, `~/.config` on Linux) automatically. Provides atomic writes, schema validation, and migration support out of the box.

**Alternatives considered:**
- Manual `fs.writeFileSync` to a JSON file: error-prone (partial writes on crash), manual path resolution
- `localStorage` in renderer: not accessible from main process; lost on app reinstall

### 5. Viewer themes: CSS custom properties, one file per theme

**Decision:** Define themes as CSS files (`src/themes/github.css`, `nord.css`, `dracula.css`, `plain.css`) that set CSS custom properties (`--md-bg`, `--md-text`, `--md-heading`, `--md-code-bg`, etc.). The active theme file is loaded into the renderer at startup. `highlight.js` theme CSS is swapped alongside.

**Rationale:** CSS custom properties cascade cleanly; switching themes is a single `<link>` swap with no React re-render of content. Theme selection is exposed via the **View** menu (native `Menu` API) and a toolbar dropdown.

**Alternatives considered:**
- Inline styles / CSS-in-JS: couples theme logic to component code
- Textual `.tcss` files: TUI-only, not applicable

### 6. Folder tree: Electron IPC + React `TreeView` component

**Decision:** Main process exposes an IPC handler `scan-folder` that returns a recursive file tree filtered to `.md` files. Renderer renders this as a custom `FolderTree` React component with expand/collapse state.

**Rationale:** File system access must stay in the main process (contextIsolation + preload bridge). Rendering the tree as a React component gives full control over filtering, icons, and keyboard navigation without a heavy dependency.

**Resizable split:** Use a `react-resizable-panels` splitter between the tree and viewer panels (default 30/70 split; user-draggable).

**Alternatives considered:**
- `react-arborist`: fully featured tree, but heavier; custom component covers requirements
- Textual `DirectoryTree`: TUI-only

## Risks / Trade-offs

- **Electron bundle size (~150 MB installed)** → Acceptable for a desktop tool; `electron-builder` ASAR packing reduces distribution size. Document in README.
- **XSS from Markdown content** → Mitigated by CSP on the renderer webview disallowing `<script>` execution; `marked` also sanitizes by default.
- **Cross-platform font rendering differences** → Test on Windows/macOS/Linux CI; embed a web-safe font stack.
- **State file corruption** → `electron-store` handles atomic writes; on schema mismatch, reset to defaults.
- **IPC overhead for large folder scans** → `scan-folder` runs async; show a loading indicator in the tree panel while scanning.

## Migration Plan

New project — no migration needed. Distribution:
```
# Development
npm run start

# Package for current OS
npm run make

# Outputs: out/make/<platform>/mdexplorer-setup.exe  (Windows)
#                              mdexplorer.dmg          (macOS)
#                              mdexplorer.AppImage     (Linux)
```

## Open Questions

- Should the tree auto-refresh when files change on disk (fs.watch)? → Implement in v1 with a manual refresh button (`F5`); fs.watch adds complexity.
- Should window state (size/position) be persisted? → Yes, via `windowBounds` in `electron-store`.

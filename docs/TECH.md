# Technical introduction

A short tour of how MdExplorer is built: the stack, the folder layout, how the processes talk to each other, and the design choices worth knowing before you change anything. For how to contribute, see [CONTRIBUTING.md](../CONTRIBUTING.md).

## Tech stack

| Layer | Technology | Notes |
|---|---|---|
| Shell | [Electron](https://www.electronjs.org/) 43 | Main process + isolated renderer, `contextIsolation` on, `nodeIntegration` off |
| Packaging | [Electron Forge](https://www.electronforge.io/) + Vite plugin | Makers: Squirrel (Windows), ZIP (macOS), deb and rpm (Linux) |
| UI | React 19 + TypeScript | Plain CSS with custom properties; no UI framework |
| Layout | `react-resizable-panels` v4 | Resizable and collapsible sidebar |
| Markdown | `marked` 18 + `highlight.js` 11 | GFM, code highlighting, custom YAML front-matter table |
| State | `electron-store` 8 | JSON file in the user data folder |
| Tests | Vitest + jsdom | Unit tests under `src/tests` |
| Specs | [OpenSpec](https://github.com/Fission-AI/OpenSpec) | Behavior specs and change history in `openspec/` |

### Pinned versions

Some dependencies are pinned on purpose. Newer majors are ESM-only and break the Vite CommonJS build of the main process:

- `electron-store@8` (v9+ is ESM-only)
- `@vitejs/plugin-react@4` (v5+ is ESM-only)

`react-resizable-panels` v4 exports `Group`, `Panel` and `Separator` (not `PanelGroup` / `PanelResizeHandle`), and uses `orientation` instead of `direction`.

## Development environment

The project is developed and tested with the versions below. Other recent versions will probably work, but these are the ones known to.

| Tool | Version | Notes |
|---|---|---|
| Node.js | 24.21.0 | Required to build and run |
| npm | 11.8.0 | Comes with Node.js |
| TypeScript | 7.0.2 | Installed by `npm install` |
| OpenSpec CLI | 1.6.0 | Required for changes under `openspec/` (`npm install -g @fission-ai/openspec`) |

Check your setup:

```bash
node -v && npm -v && openspec --version
```

Building installers for macOS and Linux has not been tried yet. On Linux, `.deb` and `.rpm` builds also need `dpkg`, `fakeroot` and `rpmbuild` on the machine.

## Folder structure

```
.
├── src/
│   ├── main/            # Electron main process
│   │   ├── index.ts     #   window, menu, IPC handlers (list-dir, search, links, files)
│   │   └── store.ts     #   persisted app state (electron-store)
│   ├── preload/
│   │   └── index.ts     # contextBridge API exposed as window.api
│   ├── renderer/        # React app
│   │   ├── App.tsx      #   top-level state, sidebar, dialogs
│   │   ├── components/  #   FolderTree, SearchPanel, TabBar, TabSwitcher, MarkdownViewer
│   │   ├── lib/         #   renderMarkdown (marked + front matter + sanitizing)
│   │   ├── themes/      #   document themes (one CSS file each)
│   │   ├── types/       #   ambient type declarations
│   │   └── index.css    #   UI tokens, UI themes, layout
│   └── tests/           # Vitest unit tests
├── config/              # Vite configs (main, preload, renderer, test)
├── scripts/             # gen-icon.mjs (icon generation), reinstall.ps1 (Windows build + reinstall)
├── assets/              # app icon (svg, png, ico)
├── openspec/            # specs/ (current behavior) and changes/ (proposals and archive)
├── docs/                # this document
├── forge.config.ts      # Electron Forge: packager, makers, Vite plugin
└── index.html           # renderer entry (loaded by Vite)
```

## Architecture

```
┌────────────────────────┐   IPC (invoke / send)   ┌──────────────────────────┐
│ Renderer (React)       │ ◀─────────────────────▶ │ Main process (Node)      │
│  App, FolderTree,      │   via preload bridge    │  list-dir, read-file,    │
│  SearchPanel, Viewer   │      window.api         │  search, resolve-link,   │
│                        │                         │  state store, menu       │
└────────────────────────┘                         └──────────────────────────┘
```

- The renderer has no Node access. Everything that touches the file system goes through the typed `window.api` defined in `src/preload/index.ts`.
- All main-process I/O uses `fs.promises`, so a huge folder never blocks the UI.

### IPC overview

| Channel | Direction | Purpose |
|---|---|---|
| `list-dir` | renderer → main | List one directory level (folders first) |
| `read-file` | renderer → main | Read a Markdown file |
| `search-start` / `search-cancel` | renderer → main | Start or stop a background search |
| `search-hits` / `search-done` | main → renderer | Stream result batches and completion |
| `resolve-link` | renderer → main | Resolve a link clicked in a document |
| `open-external` / `open-path` | renderer → main | Open a URL in the browser / a file with the OS |
| `get-state` / `set-state` | renderer ↔ main | Persisted app state |
| `open-folder-dialog` | renderer → main | Native folder picker |
| `folder-from-cli`, `open-folder-from-menu`, `open-settings`, `show-shortcuts` | main → renderer | Events from the CLI and menu |

## Key design decisions

- **Lazy folder tree.** The tree reads one directory level at a time, when you expand it. In MD-only mode every folder is shown (except `.git` and `node_modules`) because it cannot be known whether a folder contains Markdown without scanning it.
- **Background search.** Runs in the main process, streams batches of hits, is cancellable, and only covers `.md` files (name, optionally contents). The Search view stays mounted when hidden, so a search keeps running while you use the Explorer.
- **Two kinds of themes.** *Interface* themes override CSS tokens on `<html data-ui-theme>` (defined in `index.css`). *Document* themes are CSS files in `themes/`, injected as a `<style id="theme-style">` element. Do not import theme CSS statically in the renderer entry, since that permanently overrides the dynamic theme switching.
- **Links.** Link targets are resolved in the main process (relative to the current file, to the opened folder for a leading `/`, or `file:` URLs). Tabs are de-duplicated by a normalized, case-insensitive path on Windows. The window itself never navigates.
- **Safe window restore.** Saved window bounds are only used if still visible on a connected display; bounds are not saved while minimized, maximized or fullscreen.
- **Sanitizing.** Rendered Markdown has `<script>` blocks and `on*` attributes stripped before it is inserted into the page.

## Persisted state

Stored by `electron-store` as `config.json`:

| Platform | Path |
|---|---|
| Windows | `%APPDATA%\mdexplorer\config.json` |
| macOS | `~/Library/Application Support/mdexplorer/config.json` |
| Linux | `~/.config/mdexplorer/config.json` |

Fields: `lastFolder`, `openTabs`, `activeTab`, `scrollPositions`, `contentTheme`, `uiTheme`, `treeMode`, `windowBounds`.

## Where behavior is specified

Current behavior lives in `openspec/specs/<capability>/spec.md`. Proposed or in-progress changes live in `openspec/changes/`, and finished ones in `openspec/changes/archive/`.

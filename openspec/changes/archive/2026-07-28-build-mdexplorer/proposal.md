## Why

Developers and technical writers frequently navigate large folders of Markdown documentation but lack a fast, lightweight tool that understands folder structure, preserves reading position, and supports working with multiple documents simultaneously. Existing editors are too heavy; plain file browsers have no Markdown rendering.

## What Changes

- New GUI desktop application `mdexplorer` built with Electron + TypeScript + React
- Folder tree panel listing all `.md` files, hierarchically grouped by directory
- Markdown viewer panel with styled rendering (headings, code blocks, lists, tables)
- Persistent state: remembers the last opened file and scroll position across sessions
- Multi-tab support: open several `.md` files simultaneously and switch between them
- Configurable viewer theme/style (e.g., GitHub, Nord, Dracula, plain)
- Packaged as an installable OS application (`.exe`, `.dmg`, `.AppImage`/`.deb`)
- Optional CLI launch: `mdexplorer [folder]` opens the app pointed at a folder

## Capabilities

### New Capabilities

- `folder-tree`: Browse a folder recursively and list all `.md` files in a hierarchical tree panel
- `md-viewer`: Render a selected Markdown file with styled formatting (headings, code, tables, links)
- `viewer-style`: Select and persist a visual theme for the Markdown viewer
- `session-state`: Remember the last viewed document and scroll/line position, restore on next launch
- `multi-tab`: Open multiple `.md` files in tabs and switch between them without closing others

### Modified Capabilities

<!-- none — this is a new project -->

## Impact

- New Electron + React + TypeScript project; key dependencies: `electron`, `react`, `typescript`, `marked`, `highlight.js`, `electron-store`
- Stores session state via `electron-store` (auto-resolved to OS user data dir)
- Packaged and distributed via `electron-builder`; installed like any native desktop app
- No external APIs or databases; entirely local/offline
- No Python runtime required

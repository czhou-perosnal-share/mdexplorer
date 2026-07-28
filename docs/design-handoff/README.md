# Handoff: MdExplorer UX Enhancement

## Overview
A UX pass on MdExplorer (the Electron/React Markdown browser). This bundle recreates the app's current UI pixel-for-pixel, then shows an enhanced version restyled on the "Nocturne" dark design system with several functional UX improvements. Implement the **Enhanced** version in the real MdExplorer codebase (`src/renderer/`).

## About the Design Files
The file in this bundle (`MdExplorer UX Enhancement.dc.html`) is a **design reference** built as a self-contained HTML/React prototype — it is not production code to copy directly. It has two toggleable mockups (segmented control top-right):
- **Current UI**: pixel recreation of today's shipped app (GitHub theme), for side-by-side comparison.
- **Enhanced UX**: the proposed redesign.

Recreate the **Enhanced UX** mockup inside MdExplorer's existing React + TypeScript renderer, reusing its existing components (`FolderTree.tsx`, `TabBar.tsx`, `MarkdownViewer.tsx`, `App.tsx`) and CSS custom-property theming approach rather than rewriting from scratch.

## Fidelity
**High-fidelity.** Colors, spacing, typography, and component structure in the Enhanced mockup are final. Exact values below.

## What changed vs. today's UI

1. **Visual system**: moved from the light "GitHub" theme (and its Nord/Dracula/Plain siblings) as the *whole-app* theme to a single quiet dark UI (Nocturne design system: near-neutral blue-grey `#161826` ground, accent `#9184d9`, Inter typeface, 8px radii, outlined buttons).
2. **Viewer theme is now scoped, not global**: the theme picker (Nocturne / Github / Nord / Dracula / Plain) now **only re-themes the Markdown document/content pane** — not the whole app chrome (toolbar, sidebar, tabs, status bar stay Nocturne-dark always). This fixes the old behavior where switching themes changed the entire app UI. Move this dropdown to the top nav bar (not inside the tab strip) so it stays put regardless of how many tabs are open.
3. **Sidebar file filter (new)**: a "Filter files..." text input above the tree live-filters to matching files by name across the whole tree, shown as a flat result list (ignores current expand/collapse state). Case-insensitive substring match on filename.
4. **Icon-forward tree**: replaced the ASCII `▾ / ▸` expand carets and 📄 emoji file glyphs with simple line-icon SVGs (folder icon / document icon), still respecting the existing "MD Only" vs "All Files" scan mode (non-md files shown dimmed with a small "bin" tag in All Files mode).
5. **Removed the "file truncated / showing first 500 lines" behavior** entirely — files render in full, no truncation banner or status-bar "truncated" tag.
6. **Tabs**: pill-style with an accent underline on the active tab (replaces the old 2px blue bottom border), close (×) fades in on hover instead of always-on.
7. **Breadcrumb path** in the nav bar (`docs / guide.md`) replaces the old raw absolute folder path string.
8. **Empty states**: "No file open" now pairs an icon with the keyboard-shortcut hint styled as a `kbd`-like tag.
9. **Status bar**: line count shown as a small neutral tag instead of plain text.

## Layout
- App shell: column flex — nav bar (fixed height) → body (row: sidebar 280px fixed + resize handle + viewer flex-1) → status bar (fixed height).
- Sidebar (top to bottom): search field, "Files" header row with MD-only/All-files toggle button, scrollable flat tree list (indent 14px/level, 10px base padding).
- Viewer: tab strip (row, horizontal scroll) with nav-bar-hosted viewer-theme select at far right of the **nav bar**, not the tab strip; below it, the scrollable document pane (32px/40px padding).

## Design Tokens (Nocturne — see full guide in `_ds` if available in your repo, otherwise hardcode)
- Background: `#161826` · Text: `#e9e9ed` · Accent: `#9184d9`
- Neutral ramp steps used: `--color-neutral-800` (surfaces/hover), `--color-neutral-700` (borders), `--color-neutral-600` (quote rules), `--color-neutral-400/500` (muted text), `--color-neutral-200/100` (light text on dark fills)
- Font: Inter for both heading and body (`--font-heading` / `--font-body`)
- Radius: 8px scale (`--radius-sm`, `--radius-md`)
- Buttons: `.btn.btn-secondary` (outlined, not filled), `.btn.btn-icon`, `.btn.btn-ghost`
- Focus ring: 2px solid accent, 2px offset — never the browser default

### Viewer (document) theme presets — the scoped `--md-*` variables
| Theme | bg | text | link | code bg | code border |
|---|---|---|---|---|---|
| Nocturne (default) | transparent (inherits app bg) | `--color-neutral-200` | `--color-accent-300` | `--color-neutral-800` | `--color-neutral-700` |
| Github | `#ffffff` | `#24292e` | `#0366d6` | `#f6f8fa` | `#e1e4e8` |
| Nord | `#2e3440` | `#d8dee9` | `#88c0d0` | `#3b4252` | `#4c566a` |
| Dracula | `#282a36` | `#f8f8f2` | `#8be9fd` | `#44475a` | `#6272a4` |
| Plain | `#ffffff` | `#000000` | `#0000ee` | `#f5f5f5` | `#cccccc` |

(Full var lists — heading color/border, blockquote, table border/alt-row — are in the prototype's `themes`/`contentThemes` objects; carry all of them over, not just the ones in this table.)

## State Management
- `expanded: Record<dirPath, boolean>` — tree expand state (existing app already has an equivalent).
- `tabs: string[]`, `activeTab: string | null` — existing app state, unchanged.
- `treeMode: 'md-only' | 'full'` — existing app state, unchanged.
- **New**: `contentTheme: 'nocturne' | 'github' | 'nord' | 'dracula' | 'plain'` — persist alongside the other session state (`window.api.setState`), independent from any app-chrome theme (there is no longer an app-chrome theme choice).
- **New**: `search: string` — sidebar filter query, local UI state, no persistence needed.

## Interactions & Behavior
- Typing in the filter box swaps the tree view to a flat matching-files list; clearing it restores the normal expand/collapse tree.
- Selecting a Markdown file (single click) opens/activates its tab, same as today.
- Non-Markdown files in "All Files" mode are visually dimmed and not directly openable in a tab (existing double-click-to-open-externally behavior should be preserved).
- The viewer-theme select only affects the active document's rendered CSS variables — verify by switching tabs with the dropdown set to a non-default theme; the new tab's content should also pick up the same scoped theme.
- Tab close button opacity: 0.6 default, 1 on hover.

## Assets
No new binary assets. Icons are simple inline SVGs (line icons at 13–15px, `stroke="currentColor"`, `stroke-width="1.3"`) — recreate with the project's existing icon set (Phosphor icons per the Nocturne guide) rather than reusing the prototype's placeholder paths verbatim.

## Files
- `MdExplorer UX Enhancement.dc.html` — the interactive prototype (open in a browser; toggle "Current UI" / "Enhanced UX" top-right; the viewer-theme dropdown is in the Enhanced mockup's nav bar).

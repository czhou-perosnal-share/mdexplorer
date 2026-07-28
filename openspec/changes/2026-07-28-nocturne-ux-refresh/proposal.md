## Why

The app's visual system conflates two separate concerns: the whole-app chrome theme and the Markdown document rendering theme. Switching to "Dracula" turns the sidebar dark purple; switching back to "Github" turns the toolbar white. This coupling makes the app feel inconsistent and limits the ability to give the chrome a focused, stable identity. Additionally:

- There is no way to find a file by name without manually expanding directories — the sidebar has no search.
- The 10,000-line file truncation truncates real-world long documents, and the warning banner is more alarming than helpful.
- The tab close button is always-visible clutter; the tree uses ASCII carets and emoji glyphs; the toolbar displays a raw absolute path that overflows on any real machine.

This change applies the **Nocturne** dark design system to the app chrome (toolbar, sidebar, tabs, status bar) as a permanent, non-configurable choice, and moves the theme picker to a scoped **content theme** that only re-colors the Markdown document pane — matching how tools like VS Code and Obsidian handle this split.

## What Changes

- **Nocturne chrome**: single fixed dark UI for all app chrome. Background `#161826`, text `#e9e9ed`, accent `#9184d9`. No user-facing chrome theme choice. Uses Inter typeface, 8px radius scale, outlined buttons.
- **Scoped content theme**: the theme selector (`contentTheme`) now lives in the nav bar and only re-themes the `.viewer-content` document pane via scoped CSS custom properties. Five options: Nocturne (default, transparent bg inheriting the dark chrome), Github, Nord, Dracula, Plain.
- **Sidebar file filter**: a "Filter files…" text input above the folder tree; live case-insensitive substring match on filename; results displayed as a flat list independent of expand/collapse state. Clearing restores the normal tree.
- **Remove file truncation**: files render in full. Remove the 10,000-line cap, the truncation warning banner, and the "truncated" indicator in the status bar.
- **Icon-forward tree**: replace ASCII `▾`/`▸` carets and 📄 emoji with simple SVG line icons (folder icon, document icon, generic file icon for non-MD in Full mode). Chevron rotates on expand/collapse.
- **Pill tabs**: tab chips with `border-radius: 4px` and an accent underline on the active tab. Close button (`×`) is hidden by default and fades in on tab hover (opacity 0 → 0.6), full opacity on direct hover.
- **Breadcrumb path**: replace the raw absolute folder path in the nav bar with `{rootFolderName} / {activeFileName}` (or just `{rootFolderName}` when no file is active).
- **Enhanced empty state**: "No file open" viewer pairs an SVG icon with a `<kbd>`-styled shortcut hint.
- **Status bar line count**: displayed as a small neutral pill tag instead of plain text.

## Capabilities

### New Capabilities
- `sidebar-file-filter`: live text filter above the folder tree that returns a flat list of matching files.

### Modified Capabilities
- `viewer-style`: `contentTheme` replaces the old global `theme`. Picker is in the nav bar and scopes only to the document pane. App chrome is fixed Nocturne dark.
- `md-viewer`: remove the file-truncation requirement; files render in full. Status bar shows line count as a neutral tag.
- `folder-tree`: icon-forward tree items — SVG line icons replace ASCII carets and emoji glyphs.
- `multi-tab`: pill-style tabs with accent underline active indicator; hover-reveal close button.
- `tab-switcher`: overlay adopts Nocturne chrome variables.

## Impact

- `src/renderer/App.tsx` — replace `theme`/`applyTheme` with `contentTheme`/`applyContentTheme`; add `filterQuery` state and filter input; replace raw path with breadcrumb; pass `contentThemeCss` to `MarkdownViewer`; remove `truncated` handling
- `src/renderer/components/FolderTree.tsx` — SVG icons; `filterQuery` prop for flat filter mode
- `src/renderer/components/TabBar.tsx` — no logic changes; pill style driven purely by CSS
- `src/renderer/components/MarkdownViewer.tsx` — add `.viewer-content` wrapper; remove `truncated` prop and banner; no truncation rendering
- `src/renderer/lib/renderMarkdown.ts` — remove truncation banner prepend
- `src/main.ts` — remove 10,000-line cap in `read-file` handler; remove `truncated` from return value
- `src/preload.ts` + `src/renderer/types/api.d.ts` — remove `truncated` from `readFile` return type
- `src/main/store.ts` — replace `theme: string` with `contentTheme: 'nocturne' | 'github' | 'nord' | 'dracula' | 'plain'`; default `'nocturne'`
- `src/renderer/themes/github.css`, `nord.css`, `dracula.css`, `plain.css` — re-scope all custom property declarations from `:root` to `.viewer-content`
- `src/renderer/themes/nocturne.css` — new file; `.viewer-content`-scoped Nocturne content theme variables
- `src/index.css` — Nocturne design tokens on `:root`; redesigned toolbar, sidebar, tabs, status bar, filter input, empty state, breadcrumb

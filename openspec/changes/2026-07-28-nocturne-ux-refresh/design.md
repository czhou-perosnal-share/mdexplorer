## Context

The current app applies themes globally: `applyTheme(name)` in `App.tsx` injects a full CSS file (bundled via Vite `?inline`) into a `<style id="theme-style">` element in `<head>`. That CSS file sets `--md-*` custom properties on `:root`, which means every element in the app — toolbar, sidebar, tabs — inherits those variables. Switching to "Nord" turns the whole app dark blue.

The Nocturne UX refresh requires splitting this into two independent concerns:
1. **App chrome**: permanently Nocturne dark, defined directly in `src/index.css` as `:root` CSS custom properties — no runtime injection.
2. **Content pane**: scoped to `.viewer-content`, so only the rendered Markdown document area responds to the content theme picker.

## Goals / Non-Goals

**Goals:**
- Fixed Nocturne dark chrome (`#161826` bg, `#9184d9` accent, `#e9e9ed` text)
- `contentTheme` picker in the nav bar, scoped to `.viewer-content` only
- Nocturne, Github, Nord, Dracula, Plain content theme presets
- Sidebar live file filter (flat result list, substring match on filename)
- Remove all file truncation (IPC handler, banner, status bar indicator)
- SVG line icons in the folder tree (folder, document, generic file)
- Pill tabs with accent underline on active tab; hover-reveal close button
- Breadcrumb path in nav bar
- Enhanced empty state (icon + `kbd`-styled shortcut hint)
- Status bar line count as a neutral pill tag

**Non-Goals:**
- Per-tab independent content themes
- Light mode for the app chrome
- Custom user-defined themes
- Font customisation
- Virtualised tree for very large folders (pre-existing known limitation)

## Decisions

### Decision: Scope content themes by re-targeting CSS selectors to `.viewer-content`, not by Shadow DOM or inline styles

**Chosen:** Change all theme CSS files so they declare `--md-*` properties inside `.viewer-content { … }` instead of `:root { … }`. Syntax-highlight overrides (`.hljs`, etc.) are prefixed `.viewer-content .hljs`. The existing `<style id="theme-style">` head injection is kept — because the scoped selectors naturally only affect `.viewer-content`, the chrome is unaffected.

**Alternative:** Pass CSS as a string prop to `MarkdownViewer`; render a `<style>` element inside the component. More encapsulated, but adds prop plumbing and makes the style element render inside the React tree on every re-render.

**Alternative:** Apply `--md-*` vars as inline `style` attributes on `.viewer-content`. Only works for custom properties, not for class-based hljs selectors.

**Why chosen:** Minimal change — the injection mechanism is unchanged; only the target selector in the CSS files changes from `:root` to `.viewer-content`. All five themes get the same treatment.

### Decision: `contentTheme` replaces `theme` in session state; old `theme` value migrated

**Chosen:** `AppState.theme` removed; `AppState.contentTheme: 'nocturne' | 'github' | 'nord' | 'dracula' | 'plain'` added with default `'nocturne'`. On init, if the old `theme` key is present in stored state (migration path), read it as `contentTheme`; if the stored value was `'github'` (the old default), use `'nocturne'` as the new default instead.

**Why:** The `electron-store` schema migration approach is simpler than a separate migration step. The old `theme` and new `contentTheme` have overlapping names, so a direct remap works for Nord/Dracula/Plain; only 'github' → 'nocturne' default needs special handling.

### Decision: Sidebar filter is local React state, not persisted

**Chosen:** `filterQuery: string` lives in `App.tsx` local state (not session state). Cleared on app reload.

**Why:** The filter is transient — there is no meaningful "saved search" use case. Persisting it would be surprising (user relaunches the app to a filtered-down tree).

### Decision: Flat filter result list, not tree-filtered-in-place

**Chosen:** When `filterQuery` is non-empty, `FolderTree` renders a flat list of all matched leaf nodes (files), ignoring expand/collapse state and directory structure.

**Alternative:** Filter the tree in place — hide non-matching branches, show matching nodes at their original depth. More complex to implement (need to keep parent dirs visible for context) with marginal UX benefit for a simple filename filter.

**Why chosen:** Flat list is simpler, predictable, and fast to scan. Matching files are the only interesting output of a filename search.

### Decision: Truncation removal is a clean cut — no soft limit

**Chosen:** Remove the truncation entirely from the `read-file` IPC handler in `src/main.ts`. Return the full file content. Remove `truncated` from the return object. Remove the banner in `MarkdownViewer`. Remove all `truncated` tracking in `App.tsx`.

**Alternative:** Raise the limit (e.g., 50,000 lines). Rejected — the design spec is explicit about removing the behavior, and any arbitrary limit is still a surprising constraint.

**Note:** Very large files (hundreds of thousands of lines) will be slow to render since `dangerouslySetInnerHTML` forces a full DOM rewrite. This is an acceptable pre-existing trade-off; a future change could add a virtualised renderer.

### Decision: Breadcrumb derives from `rootFolder` + active tab path, not a separate data structure

**Chosen:** `rootFolderName` = `rootFolder.split(/[\\/]/).filter(Boolean).pop()`. `activeFileName` = `activeTabObj?.relativePath.split('/').pop()`. Rendered as `{rootFolderName} / {activeFileName}` with a neutral-colored `/` separator.

**Why:** No new state needed. The existing `rootFolder` and `activeTabObj.relativePath` have all the information required.

## Risks / Trade-offs

- [Content theme scope] If any future capability adds elements outside `.viewer-content` that need `--md-*` vars (e.g., a Markdown preview in a modal), those elements will not inherit the content theme. Mitigation: keep all Markdown rendering inside `.viewer-content`-classed containers.
- [Session state migration] Users upgrading from a previous version will lose their stored `theme` preference; they'll land on Nocturne (the new default). This is acceptable given that the old themes are still available as content themes.
- [Large files without truncation] The renderer will attempt to inject very large HTML strings into the DOM via `dangerouslySetInnerHTML`. This was the reason the truncation existed. For typical Markdown files this is not a concern; for multi-megabyte files it could stall rendering.

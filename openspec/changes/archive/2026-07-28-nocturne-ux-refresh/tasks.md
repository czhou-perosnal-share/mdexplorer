## 1. Nocturne Design Tokens & Chrome CSS

- [x] 1.1 In `src/index.css`, define Nocturne design tokens on `:root`: `--color-bg: #161826`, `--color-text: #e9e9ed`, `--color-accent: #9184d9`, neutral ramp (`--color-neutral-800: #1e2030`, `--color-neutral-700: #2a2d3e`, `--color-neutral-600: #3a3f55`, `--color-neutral-500: #6b7099`, `--color-neutral-400: #8b91b5`, `--color-neutral-200: #c9cce0`, `--color-neutral-100: #e9e9ed`), `--radius-sm: 4px`, `--radius-md: 8px`, `--font-body: Inter, system-ui, sans-serif`; apply `font-family: var(--font-body)` on `body`
- [x] 1.2 In `src/index.css`, restyle the `.toolbar` (nav bar): `background: var(--color-bg)`, `border-bottom: 1px solid var(--color-neutral-700)`, `color: var(--color-neutral-200)`; update `.toolbar__btn` to outlined style (`border: 1px solid var(--color-neutral-600)`, `background: transparent`, `color: var(--color-neutral-200)`); remove `.toolbar__theme` rule (replaced by content theme select in task 2.6)
- [x] 1.3 In `src/index.css`, restyle the `.panel--tree` sidebar: `background: var(--color-bg)`, `border-right: 1px solid var(--color-neutral-700)`; restyle `.tree-header` header row and toggle button with Nocturne tokens
- [x] 1.4 In `src/index.css`, restyle `.tab-bar` and `.tab-bar__tab`: dark background, pill shape (`border-radius: var(--radius-sm)`, `padding: 5px 12px`), active tab uses `border-bottom: 2px solid var(--color-accent)` underline (no filled background); hover: `background: var(--color-neutral-800)`; remove any previous active-fill style
- [x] 1.5 In `src/index.css`, update `.tab-bar__close` opacity behaviour: default `opacity: 0; transition: opacity 0.15s`, `.tab-bar__tab:hover .tab-bar__close { opacity: 0.6 }`, `.tab-bar__close:hover { opacity: 1 }`
- [x] 1.6 In `src/index.css`, restyle `.statusbar` with Nocturne tokens; restyle `.statusbar__lines` as a neutral pill tag: `background: var(--color-neutral-800)`, `padding: 1px 6px`, `border-radius: var(--radius-sm)`, `font-size: 11px`, `color: var(--color-neutral-400)`
- [x] 1.7 In `src/index.css`, add `.viewer-content` class: `padding: 32px 40px; max-width: 900px; margin: 0 auto;`

## 2. Content Theme System

- [x] 2.1 In `src/main/store.ts`, replace `theme: string` with `contentTheme: 'nocturne' | 'github' | 'nord' | 'dracula' | 'plain'` (default `'nocturne'`) in the `AppState` interface and `defaults` object; update `getState()` to read `contentTheme`
- [x] 2.2 Create `src/renderer/themes/nocturne.css` with `.viewer-content`-scoped Nocturne content theme variables: `--md-bg: transparent`, `--md-text: #c9cce0`, `--md-heading-color: #e9e9ed`, `--md-link: #b8afe8`, `--md-link-hover: #c9c3f0`, `--md-code-bg: #1e2030`, `--md-code-border: #2a2d3e`, `--md-code-text: #e9e9ed`, `--md-blockquote-border: #3a3f55`, `--md-table-border: #2a2d3e`, `--md-table-alt-row: #1e2030`, `--md-hr: #2a2d3e`; also scope any `.hljs` overrides to `.viewer-content .hljs`
- [x] 2.3 Update `src/renderer/themes/github.css`, `nord.css`, `dracula.css`, and `plain.css`: change all `:root { --md-*: … }` declarations to `.viewer-content { --md-*: … }`; prefix any `.hljs` selectors to `.viewer-content .hljs`; this ensures the content theme only affects the document pane
- [x] 2.4 In `src/renderer/App.tsx`, add `import noctureneCss from './themes/nocturne.css?inline'`; add `'nocturne'` to the `THEME_CSS` record; rename the `theme` state variable to `contentTheme`; update `THEMES` array to `['nocturne', 'github', 'nord', 'dracula', 'plain']`
- [x] 2.5 In `src/renderer/App.tsx`, rename `applyTheme` → `applyContentTheme`; its implementation is unchanged (still injects into `<style id="theme-style">` in `<head>`) — the scoping now comes from the CSS selectors changed in task 2.3
- [x] 2.6 In `src/renderer/App.tsx`, replace the `.toolbar__theme` `<select>` with a `contentTheme` select using `className="toolbar__content-theme"`; update all `theme`/`handleThemeChange` references to `contentTheme`/`handleContentThemeChange`
- [x] 2.7 In the init `useEffect` in `src/renderer/App.tsx`, read `state.contentTheme` (fall back to `'nocturne'`); if `state.theme` exists but `state.contentTheme` does not, migrate: use `state.theme` as `contentTheme` if it is one of the valid values, otherwise default to `'nocturne'`
- [x] 2.8 In `src/renderer/App.tsx`, add a `.toolbar__content-theme` CSS rule in `src/index.css` matching the styling of the old `.toolbar__theme` but using Nocturne tokens

## 3. Remove File Truncation

- [x] 3.1 In `src/main.ts`, remove the 10,000-line truncation from the `read-file` IPC handler: read the full file, return `{ content: fullContent, lineCount }` without a `truncated` field
- [x] 3.2 In `src/preload.ts`, remove `truncated` from the `readFile` return type declaration
- [x] 3.3 In `src/renderer/types/api.d.ts` (or `global.d.ts`), remove `truncated: boolean` from the `readFile` return type
- [x] 3.4 In `src/renderer/components/MarkdownViewer.tsx`, remove the `truncated` prop; remove the truncation banner conditional rendering; wrap the `dangerouslySetInnerHTML` div with `<div className="viewer-content">` so the content theme CSS scoping takes effect
- [x] 3.5 In `src/renderer/App.tsx`, remove `truncated` from the `FileData` interface; remove `truncated` from the `<MarkdownViewer>` JSX prop; remove any `truncated`-related status bar display logic

## 4. Sidebar File Filter

- [x] 4.1 In `src/renderer/App.tsx`, add `filterQuery: string` local state (default `''`); add `<input className="tree-filter" placeholder="Filter files…" value={filterQuery} onChange={e => setFilterQuery(e.target.value)} />` in the `.panel--tree` panel, above `<FolderTree>`; pass `filterQuery` to `<FolderTree>`
- [x] 4.2 In `src/renderer/components/FolderTree.tsx`, accept `filterQuery?: string` prop; when non-empty, recursively collect all file-type leaf nodes from `tree` whose `name.toLowerCase()` includes `filterQuery.toLowerCase()`; render this flat list (file items only, no directory nesting) with the same item component as the normal tree; when `filterQuery` is empty or undefined, render the normal tree unchanged
- [x] 4.3 In `src/index.css`, add `.tree-filter` input styles: `width: 100%`, `box-sizing: border-box`, `padding: 6px 10px`, `background: var(--color-neutral-800)`, `border: 1px solid var(--color-neutral-700)`, `border-radius: var(--radius-sm)`, `color: var(--color-neutral-200)`, `font-size: 13px`; `::placeholder` color `var(--color-neutral-500)`; focus: `outline: 2px solid var(--color-accent); outline-offset: -1px`

## 5. Icon-Forward Tree

- [x] 5.1 In `src/renderer/components/FolderTree.tsx`, replace the ASCII `▾`/`▸` expand caret characters with an inline SVG chevron: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 4.5l3 3 3-3"/></svg>`; apply a CSS class that rotates it 90° when the directory is collapsed (or 0° when expanded)
- [x] 5.2 In `src/renderer/components/FolderTree.tsx`, replace any emoji file glyph (📄) and plaintext folder indicator with inline SVG line icons at 14px: a folder icon for directory nodes (`<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">…</svg>`) and a document icon for `.md` file nodes; non-MD file nodes (Full mode) use a generic file icon
- [x] 5.3 In `src/index.css`, add or update `.folder-tree__icon` sizing rules: `width: 14px; height: 14px; flex-shrink: 0; color: inherit`; remove any emoji-based icon CSS

## 6. Pill Tabs

- [x] 6.1 In `src/index.css`, update `.tab-bar__tab`: add `border-radius: var(--radius-sm)`, `padding: 5px 12px`; change the active state from any filled-background style to `border-bottom: 2px solid var(--color-accent)`; add hover style `background: var(--color-neutral-800)`
- [x] 6.2 In `src/index.css`, update `.tab-bar__close` as described in task 1.5 (opacity 0 by default, 0.6 on tab hover, 1 on direct hover) — consolidate with 1.5 if implementing together

## 7. Breadcrumb Path

- [x] 7.1 In `src/renderer/App.tsx`, replace the `<span className="toolbar__folder">{rootFolder || 'No folder open'}</span>` with a breadcrumb: derive `rootFolderName = rootFolder.split(/[\\/]/).filter(Boolean).pop() ?? ''` and `activeFileName = activeTabObj?.relativePath.split('/').pop() ?? ''`; render `<span className="toolbar__breadcrumb">{rootFolderName ? (activeFileName ? `${rootFolderName} / ${activeFileName}` : rootFolderName) : 'No folder open'}</span>`
- [x] 7.2 In `src/index.css`, add `.toolbar__breadcrumb` styles: `flex: 1; font-size: 13px; color: var(--color-neutral-400); overflow: hidden; text-overflow: ellipsis; white-space: nowrap`

## 8. Empty State & Status Bar Polish

- [x] 8.1 In `src/renderer/components/MarkdownViewer.tsx`, update the `EmptyViewer` component: add a document SVG icon above the "No file open" text; wrap the keyboard shortcut hint `?` in a `<kbd className="empty-hint-kbd">` element
- [x] 8.2 In `src/index.css`, add styles for the updated empty state: `.empty-viewer { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: var(--color-neutral-500) }`; `.empty-hint-kbd { background: var(--color-neutral-800); border: 1px solid var(--color-neutral-700); border-radius: var(--radius-sm); padding: 1px 6px; font-family: var(--font-body); font-size: 12px; color: var(--color-neutral-300) }`

## 1. App state and refresh logic

- [x] 1.1 Add `isRefreshing` boolean state to `App.tsx`
- [x] 1.2 Add `handleRefresh` async callback: set `isRefreshing = true`, call `loadFolder(rootFolder, treeMode)`, set `isRefreshing = false`
- [x] 1.3 Add `F5` keydown handler on `window` in the existing `useEffect`: call `handleRefresh` when `rootFolder` is non-empty

## 2. Refresh button in the sidebar header

- [x] 2.1 Add a `<RefreshIcon />` SVG component (circular arrow, 13×13, matching existing FolderIcon/DocIcon style)
- [x] 2.2 Add the refresh `<button>` to the `tree-files-header` JSX in `App.tsx`, between the "Files" label and the MD-only toggle, with `disabled={!rootFolder || isRefreshing}` and `title="Refresh folder (F5)"`

## 3. Styles

- [x] 3.1 Add `.tree-refresh-btn` to `src/renderer/index.css` — ghost icon button, same pattern as `.tree-mode-toggle`: `padding: 2px 4px`, transparent background, accent hover, disabled opacity 0.4
- [x] 3.2 Add spinning animation class `.tree-refresh-btn--spinning` (CSS `@keyframes spin`, applied while `isRefreshing` is true)

## 4. Loading overlay

- [x] 4.1 Rename `isRefreshing` → `isTreeLoading` throughout `App.tsx` (state declaration, `handleRefresh`, and button `disabled` prop)
- [x] 4.2 Update `handleTreeModeToggle` in `App.tsx` to set `isTreeLoading = true` before the `scanFolder` call and `false` after
- [x] 4.3 Add a `.tree-panel-overlay` `<div>` inside the sidebar `<Panel>`, rendered only when `isTreeLoading` is true, positioned absolutely over the tree content
- [x] 4.4 Add `.tree-panel-overlay` CSS to `src/renderer/index.css`: `position: absolute; inset: 0; background: rgba(22,24,38,0.55); display: flex; align-items: center; justify-content: center; z-index: 10; pointer-events: none;`

## 5. Verify

- [x] 5.1 Open a folder, add/delete a file externally, click Refresh — tree updates
- [x] 5.2 Press `F5` — same result as clicking Refresh
- [x] 5.3 No folder open — Refresh button is visually disabled and non-interactive
- [x] 5.4 Click Refresh — overlay appears over tree while scanning, disappears when done
- [x] 5.5 Click MD-only/All-files toggle — overlay appears while mode switch scans, disappears when done

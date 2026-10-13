## 1. IPC — Full Scan and Open Path

- [x] 1.1 Extend `scan-folder` IPC handler in `src/main.ts` to accept an optional `mode: 'md-only' | 'full'` parameter; when `full`, skip the Markdown-only filter and return all files and directories
- [x] 1.2 Add `open-path` IPC handler in `src/main.ts` using `shell.openPath(absolutePath)`; return the error string on failure so the renderer can surface it

## 2. Preload Bridge and Types

- [x] 2.1 Expose `openPath(absolutePath: string): Promise<string>` on `window.api` in `src/preload.ts`
- [x] 2.2 Add `scanFolder` overload and `openPath` signature to `src/renderer/types/api.d.ts`

## 3. Session State

- [x] 3.1 Add `treeMode: 'md-only' | 'full'` field to `AppState` interface in `src/main/store.ts` with default `'md-only'`

## 4. FolderTree Component

- [x] 4.1 Add `mode: 'md-only' | 'full'` prop to `FolderTree`; when `full`, render all nodes regardless of file type
- [x] 4.2 Style non-Markdown file items in Full mode with reduced opacity (dimmed) so `.md` files stand out
- [x] 4.3 Implement double-click handler on non-Markdown file items: call `window.api.openPath(absolutePath)`; on error, emit an `onOpenError(msg)` callback prop
- [x] 4.4 Ensure single-click on a non-Markdown file selects/focuses the item but does NOT call `onFileSelect`

## 5. App Shell

- [x] 5.1 Add `treeMode` state to `App.tsx` (default `'md-only'`); restore from session state on mount; persist on change
- [x] 5.2 Pass `mode` prop down to `FolderTree`; re-scan the folder (or re-filter cached data) when mode changes
- [x] 5.3 Add a toggle button in the toolbar (or tree panel header) labelled **"MD Only"** / **"Show All"** that flips `treeMode`
- [x] 5.4 On `openPath` error, display a brief message in the status bar

## 6. Styles

- [x] 6.1 Add `.folder-tree__item--non-md` CSS rule in `src/index.css` with `opacity: 0.45` and `cursor: default`
- [x] 6.2 Style the tree mode toggle button to visually indicate active mode (e.g., highlighted when in Full mode)

## 1. Window position

- [x] 1.1 Validate saved bounds against `screen.getAllDisplays()` work areas; center on primary when not visible
- [x] 1.2 Skip saving bounds while minimized, maximized or fullscreen

## 2. Async main-process IO and lazy tree

- [x] 2.1 Replace synchronous `scanFolder`/`readFileSync` with async `list-dir` (one level, folders first, `.git`/`node_modules` hidden in MD-only) and async `read-file`
- [x] 2.2 Rewrite `FolderTree` to cache children per directory, load on expand, support Left/Right arrow keys
- [x] 2.3 Make refresh re-list root and expanded folders; mode toggle resets to collapsed root
- [x] 2.4 Remove the full-scan progress dialog and `scan-folder`/`cancel-scan` IPC

## 3. Startup folder prompt

- [x] 3.1 Replace automatic last-folder load with the "Open previous / Choose another… / Not now" dialog
- [x] 3.2 Make CLI and menu folders skip the prompt; open new folder clears tabs

## 4. Sidebar and search

- [x] 4.1 Add activity bar with Explorer, Search and Settings icons and collapsible sidebar panel
- [x] 4.2 Keep Explorer and Search views mounted while hidden; add `Ctrl+Shift+F`
- [x] 4.3 Implement `search-start`/`search-cancel` with streamed `search-hits`/`search-done`, Markdown-only, 2000-hit and 2 MB limits
- [x] 4.4 Build `SearchPanel` (debounced input, contents option, progress, Stop, results) and remove the old filter box

## 5. Settings and themes

- [x] 5.1 Add `uiTheme` to persisted state and tokenise hard-coded overlay/shadow/selection/warning colors
- [x] 5.2 Add Nocturne, Light, Graphite and High-contrast theme token sets via `data-ui-theme`
- [x] 5.3 Add Settings dialog (File → Settings…, `Ctrl+,`, gear-wheel icon) with interface and document theme

## 6. Document links

- [x] 6.1 Add `resolve-link` and `open-external` IPC handlers; block window navigation and new windows
- [x] 6.2 Handle link clicks in `MarkdownViewer` (anchors, relative `.md`, external, other files, missing target)
- [x] 6.3 Deduplicate tabs with case-insensitive path keys and a synchronous `tabsRef`

## 7. Verification

- [x] 7.1 Type-check and run unit tests; rebuild and reinstall the Squirrel installer locally
- [ ] 7.2 Manually verify on a very large folder: startup prompt, lazy expand, search with Stop, link opening, themes

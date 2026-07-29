## Why

The folder tree is scanned once when a folder is opened and never updates automatically. When files are added, renamed, or deleted by another app or the OS, the tree stays stale until the user reopens the folder — there is no way to refresh without that workaround.

## What Changes

- Add a **Refresh** icon button to the sidebar Files header row, next to the existing MD-only/All-files toggle
- Clicking it rescans the current folder with the current mode and rebuilds the tree
- Button is disabled (greyed) when no folder is open
- Keyboard shortcut `F5` triggers the same refresh
- A **loading overlay** floats over the tree content area whenever any rescan is in progress — triggered by both the refresh button and the MD-only/All-files mode toggle

## Capabilities

### New Capabilities

- `tree-refresh`: Refresh button and keyboard shortcut that rescan the current open folder on demand

### Modified Capabilities

- `folder-tree`: The Files header row gains a new interactive control (refresh button); existing MD-only/Full toggle and filter behavior unchanged

## Impact

- `src/renderer/App.tsx`: add `handleRefresh` callback, wire `F5` keydown, pass refresh button and loading overlay into sidebar JSX; `handleTreeModeToggle` also sets loading state
- `src/renderer/index.css`: add `.tree-refresh-btn` styles and `.tree-panel-overlay` floating loading layer
- No IPC changes — refresh reuses the existing `window.api.scanFolder` call
- No session state changes — refresh is a transient action, not persisted

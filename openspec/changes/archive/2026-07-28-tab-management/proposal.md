## Why

When many Markdown files are open, the tab bar becomes unwieldy: there is no fast keyboard-driven switcher, no way to close multiple tabs at once, and files with identical names (e.g. `README.md` in different subdirectories) are indistinguishable from their tab labels. These three gaps make multi-file workflows frustrating.

## What Changes

- **Quick tab switcher**: A keyboard-triggered overlay (`Ctrl+Shift+E`) that lists all open tabs, supports fuzzy search by filename or path, and activates the selected tab on Enter. A toolbar icon button also opens the switcher for discoverability. The shortcut is listed in the keyboard shortcuts help panel (`?`).
- **Batch close**: A right-click context menu on any tab with actions: "Close Others", "Close to the Right", and "Close All". Also a "Close All" button accessible from the context menu.
- **Disambiguated tab labels**: When two or more open tabs share the same filename, all affected tabs append their nearest distinguishing parent folder segment (e.g. `api/README.md` vs `guide/README.md`). Unique filenames remain displayed as-is.

## Capabilities

### New Capabilities
- `tab-switcher`: Keyboard-driven overlay to fuzzy-search and jump to any open tab
- `tab-context-menu`: Right-click context menu on tabs for batch close actions

### Modified Capabilities
- `multi-tab`: Tab title disambiguation requirement — currently tabs always show filename only; now they show `folder/filename` when duplicates exist

## Impact

- `src/renderer/components/TabBar.tsx` — add right-click context menu, update label logic for disambiguation
- `src/renderer/components/TabSwitcher.tsx` — new component for the switcher overlay
- `src/renderer/App.tsx` — wire switcher open/close state, keyboard shortcut, batch-close handlers
- `src/index.css` — styles for context menu and switcher overlay

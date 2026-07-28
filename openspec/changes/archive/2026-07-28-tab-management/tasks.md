## 1. Tab Label Disambiguation

- [x] 1.1 Add `computeLabels(tabs: Tab[]): Record<string, string>` pure function in `TabBar.tsx` that returns a map of `absolutePath → displayLabel`; for tabs with unique filenames return the filename only; for duplicate filenames return `parentFolder/filename`; if `parentFolder/filename` is still non-unique fall back to the full relative path
- [x] 1.2 Replace the hardcoded `tab.name` display in `TabBar.tsx` with the computed label from `computeLabels`

## 2. Tab Context Menu

- [x] 2.1 Add `onCloseOthers`, `onCloseToRight`, `onCloseAll` callback props to `TabBar`
- [x] 2.2 Implement the three batch-close handlers in `App.tsx`: `closeOthers(absolutePath)`, `closeToTheRight(absolutePath)`, `closeAll()`; each updates tabs state and persists to session state
- [x] 2.3 Add context menu state to `TabBar`: `menuAnchor: { x, y, tabPath } | null`; set it on `onContextMenu` of each tab item; prevent the default browser context menu
- [x] 2.4 Render a positioned `<div>` context menu when `menuAnchor` is set, with items: "Close", "Close Others", "Close to the Right", "Close All"
- [x] 2.5 Wire each menu item to the appropriate callback (`onTabClose`, `onCloseOthers`, `onCloseToRight`, `onCloseAll`)
- [x] 2.6 Close the context menu on outside `mousedown` (document-level listener) and on `Escape` keydown

## 3. Tab Switcher Component

- [x] 3.1 Create `src/renderer/components/TabSwitcher.tsx`: a fixed-overlay component that receives `tabs`, `onActivate(absolutePath)`, `onClose()` props; renders a search input and a filtered list of tabs
- [x] 3.2 Implement fuzzy (substring) filtering in `TabSwitcher`: filter `tabs` by `relativePath.toLowerCase().includes(query.toLowerCase())`; show full relative path in each list item
- [x] 3.3 Implement keyboard navigation in `TabSwitcher`: `↑`/`↓` to move selection, `Enter` to activate selected tab and close overlay, `Escape` to close overlay; auto-focus the search input on mount
- [x] 3.4 Implement mouse click on a list item: activate that tab and close overlay
- [x] 3.5 Show "No matching tabs" empty state when the filtered list is empty

## 4. Wire Switcher into App

- [x] 4.1 Add `showSwitcher` boolean state to `App.tsx` (default `false`)
- [x] 4.2 Register `Ctrl+Shift+E` keydown listener in `App.tsx` (alongside existing shortcuts); open the switcher only when at least one tab is open; prevent default
- [x] 4.3 Render `<TabSwitcher>` conditionally when `showSwitcher` is true; pass `tabs`, `onActivate` (calls `setActiveTab` + closes overlay), `onClose` (sets `showSwitcher` to false)

## 5. Tab Switcher Discoverability

- [x] 5.1 Add a tab switcher icon button to the toolbar in `App.tsx` (alongside the theme dropdown); clicking it sets `showSwitcher` to true; button is disabled or hidden when `tabs.length === 0`
- [x] 5.2 Add `Ctrl+Shift+E` entry to the keyboard shortcuts table in the `showShortcuts` modal in `App.tsx`: label `Ctrl+Shift+E`, description "Open tab switcher"
- [x] 5.3 Add CSS for the toolbar icon button in `src/index.css` so it matches the existing toolbar button style

## 6. Styles

- [x] 6.1 Add context menu CSS in `src/index.css`: `position: fixed`, `z-index: 500`, background uses `--panel-bg`, border uses `--toolbar-border`, shadow, item hover highlight
- [x] 6.2 Add tab switcher CSS in `src/index.css`: full-screen backdrop (`position: fixed`, `inset: 0`, semi-transparent), centered modal card, search input styling, list item hover and selected states

## Context

The current tab bar (`TabBar.tsx`) is a simple horizontal scroll of tabs with individual close buttons and `Ctrl+Tab` / `Ctrl+W` keyboard shortcuts. It has no search/switch mechanism, no batch-close actions, and always shows only the bare filename — making large tab sets and duplicate filenames hard to navigate.

Three isolated capabilities need to be added: a switcher overlay, a context menu, and smarter tab label logic.

## Goals / Non-Goals

**Goals:**
- `Ctrl+Shift+E` opens a fuzzy-searchable tab switcher overlay
- A toolbar icon button opens the same overlay for mouse-accessible discoverability
- `Ctrl+Shift+E` is listed in the keyboard shortcuts help panel (`?`)
- Right-click on any tab shows a context menu: Close, Close Others, Close to the Right, Close All
- Tab labels automatically disambiguate when two open tabs share the same filename

**Non-Goals:**
- Tab reordering via drag-and-drop
- Tab pinning
- Tab groups or split-pane views
- Persisting batch-close in session state beyond what already exists (tabs list is already persisted)

## Decisions

### Decision: Tab switcher as a React overlay in App.tsx, not a separate window

**Chosen:** A `<TabSwitcher>` component rendered in the React tree with a fixed-position overlay, controlled by `showSwitcher` boolean state in `App.tsx`.

**Alternative:** Electron `BrowserWindow` dialog. Rejected — overkill, slower to open, harder to share tab state.

**Why chosen:** The renderer already owns tab state; keeping it in-tree means no IPC, instant open, shared React context.

### Decision: Fuzzy match via simple substring-includes, not a library

**Chosen:** `relativePath.toLowerCase().includes(query.toLowerCase())` — case-insensitive substring match against the full relative path.

**Alternative:** Import a fuzzy library (fuse.js, etc.). Rejected — adds a dependency for a feature where simple substring matching is sufficient and predictable.

### Decision: Context menu as a positioned `<div>`, not a native menu

**Chosen:** A React `<div>` rendered at the cursor's `clientX/clientY` position, styled as a dropdown. Closed on `mousedown` outside via a document-level listener.

**Alternative:** Electron's `Menu.buildFromTemplate` via IPC. Rejected — requires IPC roundtrip; can't share React callbacks (closeOthers, etc.) without threading paths through IPC.

### Decision: Disambiguation computed in TabBar from the `tabs` prop

**Chosen:** A pure `computeLabels(tabs: Tab[]) → Record<absolutePath, displayLabel>` function inside `TabBar.tsx`. Groups tabs by filename; any group with >1 member gets the parent folder prepended.

**Why:** Pure function, easy to test, no new state. Re-runs on every render (tabs list is small).

**Edge case:** If `parent/filename` is still non-unique (e.g. `a/b/README.md` and `a/b/README.md` — exact same path, already deduplicated by `openTab`), this can't happen. If `folder/filename` is still ambiguous (two files named `README.md` each in a folder named `src`), fall back to the full relative path.

## Risks / Trade-offs

- [Context menu z-index] Must render above all other UI including the tab bar scroll container → use `position: fixed` and `z-index: 500`.
- [Switcher keyboard trap] While the switcher is open, `Ctrl+Tab` / `Ctrl+W` must not fire → stop propagation inside the switcher's keydown handler.
- [Tab list scroll + context menu] If the tab bar is scrolled, `clientX/clientY` of the right-click is already viewport-relative, so `position: fixed` placement is correct without scroll offset math.

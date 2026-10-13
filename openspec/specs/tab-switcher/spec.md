## Purpose

Defines the keyboard-driven tab switcher overlay.
## Requirements
### Requirement: Keyboard-triggered tab switcher overlay
The application SHALL provide a tab switcher overlay that opens with `Ctrl+Shift+E` and lists all currently open tabs. The overlay SHALL close on `Escape` or when focus leaves it.

#### Scenario: Open switcher with keyboard shortcut
- **WHEN** one or more tabs are open and the user presses `Ctrl+Shift+E`
- **THEN** the tab switcher overlay appears, listing all open tabs with their relative paths

#### Scenario: Switcher does not open with no tabs
- **WHEN** no tabs are open and the user presses `Ctrl+Shift+E`
- **THEN** the overlay does not appear

#### Scenario: Close switcher with Escape
- **WHEN** the tab switcher overlay is open and the user presses `Escape`
- **THEN** the overlay closes and focus returns to the previously active tab

### Requirement: Fuzzy search within the tab switcher
The switcher SHALL include a text input that filters the listed tabs in real time by fuzzy-matching against the file's relative path (case-insensitive). The first match SHALL be pre-selected.

#### Scenario: Filter by partial filename
- **WHEN** the user types `read` in the switcher input
- **THEN** only tabs whose relative path contains `read` (case-insensitive) are shown

#### Scenario: Filter by path segment
- **WHEN** the user types `api/ref`
- **THEN** only tabs whose relative path contains `api/ref` are shown

#### Scenario: No matches
- **WHEN** the search string matches no open tab
- **THEN** the list shows an empty state: "No matching tabs"

### Requirement: Tab switcher accessible via toolbar icon button
The toolbar SHALL include an icon button that opens the tab switcher overlay, providing a mouse-accessible entry point for the feature. The button SHALL only be interactive when at least one tab is open.

#### Scenario: Click toolbar icon opens switcher
- **WHEN** one or more tabs are open and the user clicks the tab switcher icon in the toolbar
- **THEN** the tab switcher overlay appears, listing all open tabs

#### Scenario: Icon button inactive with no tabs
- **WHEN** no tabs are open
- **THEN** the icon button is visually disabled (or absent) and clicking it has no effect

### Requirement: Tab switcher shortcut listed in keyboard help panel
The `Ctrl+Shift+E` shortcut for the tab switcher SHALL appear in the application's keyboard shortcuts help panel (opened with `?`).

#### Scenario: Shortcut visible in help panel
- **WHEN** the user opens the keyboard shortcuts panel via `?`
- **THEN** the panel lists `Ctrl+Shift+E` with the description "Open tab switcher"

### Requirement: Activate tab from switcher
The user SHALL be able to activate a tab from the switcher by pressing `Enter` on the selected item, clicking it, or using `↑`/`↓` arrows to navigate and then `Enter`.

#### Scenario: Activate with Enter
- **WHEN** the switcher is open, an item is highlighted, and the user presses `Enter`
- **THEN** the overlay closes and the corresponding tab becomes active

#### Scenario: Activate with mouse click
- **WHEN** the switcher is open and the user clicks a list item
- **THEN** the overlay closes and the corresponding tab becomes active

#### Scenario: Navigate list with arrow keys
- **WHEN** the switcher is open and the user presses `↓`
- **THEN** the highlight moves to the next item in the filtered list

### Requirement: Tab switcher overlay uses Nocturne chrome variables
The tab switcher overlay (backdrop and modal card) SHALL use the Nocturne dark design system tokens for its background, border, text, and accent colors, consistent with the rest of the app chrome.

#### Scenario: Overlay backdrop uses dark tokens
- **WHEN** the tab switcher overlay is open
- **THEN** the backdrop has a semi-transparent dark background; the modal card uses `--color-bg` as its background, `--color-neutral-700` as its border, and `--color-neutral-200` as its text color

#### Scenario: Selected item uses accent color
- **WHEN** an item in the tab switcher list is highlighted (keyboard navigation or hover)
- **THEN** it is highlighted using the accent color (`#9184d9`) as the selection background or left-border indicator


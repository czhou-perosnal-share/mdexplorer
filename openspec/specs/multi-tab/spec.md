## Purpose

Defines opening, switching and closing documents in tabs.
## Requirements
### Requirement: Open multiple Markdown files as tabs
The viewer panel SHALL support opening multiple `.md` files simultaneously, each in its own tab. Switching tabs SHALL update the viewer content without closing other files.

#### Scenario: Open second file in new tab
- **WHEN** the user selects a file from the tree while another file is already open
- **THEN** the new file opens in a new tab and becomes the active tab

#### Scenario: Switch between tabs via mouse click
- **WHEN** multiple tabs are open and the user clicks a tab header
- **THEN** that tab becomes active and its content is displayed in the viewer

#### Scenario: Switch between tabs via keyboard
- **WHEN** multiple tabs are open and the user presses `Ctrl+Tab` or `Ctrl+Shift+Tab`
- **THEN** focus cycles forward or backward through the open tabs

### Requirement: Close individual tabs
The user SHALL be able to close individual tabs via the close button (×) on the tab or via `Ctrl+W`. Closing the last remaining tab SHALL leave the viewer in an empty state.

#### Scenario: Close tab with close button
- **WHEN** the user clicks the × button on a tab
- **THEN** the tab closes and the next available tab (or previous if it was the last) becomes active

#### Scenario: Close active tab with keyboard
- **WHEN** the user presses `Ctrl+W`
- **THEN** the active tab closes and focus moves to the next available tab

#### Scenario: Close last tab
- **WHEN** only one tab is open and the user closes it
- **THEN** the viewer shows an empty state message: "No file open — select a file from the tree"

### Requirement: Prevent duplicate tabs
If the user attempts to open a file that is already open in a tab, the application SHALL switch to the existing tab rather than opening a duplicate.

#### Scenario: File already open
- **WHEN** the user selects a file from the tree that is already open in a tab
- **THEN** the existing tab is activated; no duplicate tab is created

### Requirement: Tab title shows filename with disambiguation
Each tab header SHALL display the filename (not the full path) when the filename is unique across all open tabs. When two or more open tabs share the same filename, ALL affected tabs SHALL display the nearest distinguishing parent folder segment prepended (e.g. `api/README.md` and `guide/README.md`). The full relative path SHALL appear as a tooltip on hover and in the status bar when the tab is active.

#### Scenario: Tab label shows filename only when unique
- **WHEN** a file at `docs/api/reference.md` is open and no other open tab is named `reference.md`
- **THEN** the tab header shows `reference.md`

#### Scenario: Tab label disambiguates duplicate filenames
- **WHEN** both `api/README.md` and `guide/README.md` are open
- **THEN** the first tab shows `api/README.md` and the second shows `guide/README.md`

#### Scenario: Disambiguation updates when duplicate is closed
- **WHEN** two tabs both showing `api/README.md` / `guide/README.md` are open and the user closes `guide/README.md`
- **THEN** the remaining tab reverts to showing `README.md` (no longer needs disambiguation)

#### Scenario: Full path in status bar
- **WHEN** a tab is active
- **THEN** the status bar shows the full relative path (e.g. `docs/api/reference.md`)

#### Scenario: Tooltip shows full path
- **WHEN** the user hovers over a tab header
- **THEN** a tooltip shows the full relative path of that file

### Requirement: Pill-style tab presentation with accent underline
Tab items in the tab bar SHALL use a pill shape (`border-radius: 4px`) and indicate the active tab via a 2px accent-colored underline (`#9184d9`) rather than a filled background color. The inactive tab hover state uses a subtle dark background tint.

#### Scenario: Active tab has accent underline
- **WHEN** a tab is the currently active tab
- **THEN** it displays a 2px solid accent-colored (`#9184d9`) underline at the bottom of the pill; the pill background is not filled

#### Scenario: Inactive tab hover shows tint
- **WHEN** the user hovers over an inactive tab
- **THEN** the tab pill receives a subtle dark background tint (`--color-neutral-800`)

### Requirement: Always-visible close button at reduced opacity
The close button (×) on each tab SHALL be visible at reduced opacity (`0.6`) at all times and SHALL reach full opacity (`1`) when the user hovers directly over the close button itself.

#### Scenario: Close button visible on all tabs
- **WHEN** any tab is rendered
- **THEN** the close button is visible at `opacity: 0.6`

#### Scenario: Close button fully visible on direct hover
- **WHEN** the user moves the pointer directly over the close button
- **THEN** the close button is fully opaque (opacity 1)


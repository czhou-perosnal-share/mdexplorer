## ADDED Requirements

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

### Requirement: Tab title shows filename
Each tab header SHALL display the filename (not the full path). The full relative path SHALL appear as a tooltip on hover and in the status bar when the tab is active.

#### Scenario: Tab label shows filename only
- **WHEN** a file at `docs/api/reference.md` is open in a tab
- **THEN** the tab header shows `reference.md`

#### Scenario: Full path in status bar
- **WHEN** a tab is active
- **THEN** the status bar shows the full relative path `docs/api/reference.md`

#### Scenario: Tooltip shows full path
- **WHEN** the user hovers over a tab header
- **THEN** a tooltip shows the full relative path of that file

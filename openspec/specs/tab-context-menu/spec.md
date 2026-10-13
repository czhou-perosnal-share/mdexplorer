## Purpose

Defines the context menu available on document tabs.

## Requirements

### Requirement: Right-click context menu on tabs
Right-clicking any tab header SHALL open a context menu with batch-close actions. The menu SHALL close when the user clicks outside it or presses `Escape`.

#### Scenario: Open context menu on right-click
- **WHEN** the user right-clicks a tab header
- **THEN** a context menu appears near the cursor with options: "Close", "Close Others", "Close to the Right", "Close All"

#### Scenario: Dismiss context menu on outside click
- **WHEN** the context menu is open and the user clicks outside it
- **THEN** the menu closes with no action taken

#### Scenario: Dismiss context menu on Escape
- **WHEN** the context menu is open and the user presses `Escape`
- **THEN** the menu closes with no action taken

### Requirement: Close Others
"Close Others" SHALL close all open tabs except the one that was right-clicked, and activate that tab.

#### Scenario: Close Others leaves one tab
- **WHEN** the user right-clicks tab B out of tabs [A, B, C] and selects "Close Others"
- **THEN** tabs A and C close, tab B remains open and becomes active

### Requirement: Close to the Right
"Close to the Right" SHALL close all tabs that appear to the right of the right-clicked tab in the tab bar order. The right-clicked tab remains open and active.

#### Scenario: Close to the Right removes subsequent tabs
- **WHEN** the user right-clicks tab B out of tabs [A, B, C, D] and selects "Close to the Right"
- **THEN** tabs C and D close; tabs A and B remain; B becomes active

#### Scenario: Close to the Right on last tab is a no-op
- **WHEN** the user right-clicks the rightmost tab and selects "Close to the Right"
- **THEN** no tabs are closed

### Requirement: Close All
"Close All" SHALL close every open tab, leaving the viewer in the empty state.

#### Scenario: Close All empties the tab bar
- **WHEN** the user selects "Close All" from the context menu
- **THEN** all tabs close and the viewer shows the empty state: "No file open — select a file from the tree"

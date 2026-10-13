## Purpose

Defines requirements for the tree-refresh capability — the on-demand rescan of the open folder that updates the sidebar file tree to reflect the current filesystem state.
## Requirements
### Requirement: Refresh button rescans the open folder on demand
The sidebar Files header row SHALL include a refresh icon button that, when clicked, re-lists the root folder and every currently expanded folder using the current tree mode (MD-only or Full), keeping expanded folders expanded and dropping those that no longer exist.

#### Scenario: Refresh button visible when folder is open
- **WHEN** a folder is open
- **THEN** a refresh icon button is visible in the Files header row

#### Scenario: Refresh button disabled when no folder is open
- **WHEN** no folder has been opened
- **THEN** the refresh button is present but disabled (non-interactive, reduced opacity)

#### Scenario: Clicking refresh updates the tree
- **WHEN** the user clicks the refresh button while a folder is open
- **THEN** the root and expanded folders are re-listed and the tree reflects the current filesystem state with expanded folders still expanded

#### Scenario: Refresh button shows loading state during refresh
- **WHEN** the refresh is in progress
- **THEN** the refresh button is disabled and shows a visual in-progress indicator, preventing double-clicks

#### Scenario: F5 triggers refresh
- **WHEN** the user presses `F5` and a folder is open
- **THEN** the tree is refreshed, identical to clicking the refresh button

#### Scenario: F5 does nothing when no folder is open
- **WHEN** the user presses `F5` and no folder is open
- **THEN** nothing happens


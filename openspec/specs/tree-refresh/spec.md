## Purpose

Defines requirements for the tree-refresh capability — the on-demand rescan of the open folder that updates the sidebar file tree to reflect the current filesystem state.

## Requirements

### Requirement: Refresh button rescans the open folder on demand
The sidebar Files header row SHALL include a refresh icon button that, when clicked, rescans the currently open folder using the current tree mode (MD-only or Full) and updates the folder tree with the result.

#### Scenario: Refresh button visible when folder is open
- **WHEN** a folder is open
- **THEN** a refresh icon button is visible in the Files header row

#### Scenario: Refresh button disabled when no folder is open
- **WHEN** no folder has been opened
- **THEN** the refresh button is present but disabled (non-interactive, reduced opacity)

#### Scenario: Clicking refresh updates the tree
- **WHEN** the user clicks the refresh button while a folder is open
- **THEN** the folder is rescanned with the current mode and the tree reflects the current filesystem state

#### Scenario: Refresh button shows loading state during rescan
- **WHEN** the rescan is in progress
- **THEN** the refresh button is disabled and shows a visual in-progress indicator, preventing double-clicks

#### Scenario: Tree panel shows loading overlay during refresh
- **WHEN** the refresh rescan is in progress
- **THEN** a semi-transparent overlay covers the tree content area, signalling that the list is being updated

#### Scenario: F5 triggers refresh
- **WHEN** the user presses `F5` and a folder is open
- **THEN** the folder is rescanned, identical to clicking the refresh button

#### Scenario: F5 does nothing when no folder is open
- **WHEN** the user presses `F5` and no folder is open
- **THEN** nothing happens

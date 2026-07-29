## Requirements

### Requirement: Files header row controls
The sidebar Files header row SHALL contain, from left to right: the "Files" label, the refresh icon button, and the MD-only/All-files toggle button. The refresh button SHALL be visually separated from the label and styled as a ghost icon button consistent with the Nocturne design system.

#### Scenario: Files header row layout
- **WHEN** a folder is open
- **THEN** the header row shows the "Files" label on the left, the refresh button and MD-only/All-files toggle on the right

#### Scenario: MD-only toggle shows loading overlay during rescan
- **WHEN** the user clicks the MD-only/All-files toggle
- **THEN** the tree mode switches, a loading overlay appears over the tree content area while the rescan runs, and the overlay disappears once the new tree is rendered

### Requirement: Filter tree to Markdown files only
The folder tree SHALL only display `.md` files and directories that contain at least one `.md` file (directly or recursively) when the tree is in **MD-only mode**. In **Full mode** this filter is disabled and all files and directories are shown. Non-Markdown files and empty directories SHALL be hidden only when in MD-only mode.

#### Scenario: Mixed content folder in MD-only mode
- **WHEN** the folder contains `.md`, `.txt`, `.py`, and subdirectories and the tree is in MD-only mode
- **THEN** only `.md` files and directories containing `.md` files appear in the tree

#### Scenario: Mixed content folder in Full mode
- **WHEN** the folder contains `.md`, `.txt`, `.py`, and subdirectories and the tree is in Full mode
- **THEN** all files and all directories appear in the tree

#### Scenario: Empty subdirectory hidden in MD-only mode
- **WHEN** a subdirectory contains no `.md` files at any depth and the tree is in MD-only mode
- **THEN** that subdirectory does not appear in the tree

#### Scenario: Empty subdirectory visible in Full mode
- **WHEN** a subdirectory contains no `.md` files at any depth and the tree is in Full mode
- **THEN** that subdirectory appears in the tree

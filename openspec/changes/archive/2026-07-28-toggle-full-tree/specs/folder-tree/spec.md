## MODIFIED Requirements

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

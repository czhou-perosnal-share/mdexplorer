## MODIFIED Requirements

### Requirement: Files header row controls
The sidebar Files header row SHALL contain, from left to right: the "Files" label, the refresh icon button, and the MD-only/All-files toggle button. The refresh button SHALL be visually separated from the label and styled as a ghost icon button consistent with the Nocturne design system.

#### Scenario: Files header row layout
- **WHEN** a folder is open
- **THEN** the header row shows the "Files" label on the left, the refresh button and MD-only/All-files toggle on the right

#### Scenario: MD-only toggle re-lists the tree
- **WHEN** the user clicks the MD-only/All-files toggle
- **THEN** the tree mode switches and the tree is re-listed from a collapsed root in the new mode

### Requirement: Filter tree to Markdown files only
The folder tree SHALL be loaded lazily: opening a folder lists only its first level, and the contents of a directory SHALL be read only when the user expands it (folders listed before files). In **MD-only mode** the tree SHALL list only `.md` files, and all directories except `.git` and `node_modules` (whether a directory contains Markdown cannot be known without scanning it). In **Full mode** all files and directories SHALL be listed.

#### Scenario: Mixed content folder in MD-only mode
- **WHEN** the folder contains `.md`, `.txt`, `.py`, and subdirectories and the tree is in MD-only mode
- **THEN** only `.md` files and the subdirectories (except `.git` and `node_modules`) appear in the tree

#### Scenario: Mixed content folder in Full mode
- **WHEN** the folder contains `.md`, `.txt`, `.py`, and subdirectories and the tree is in Full mode
- **THEN** all files and all directories appear in the tree

#### Scenario: Directory contents load on expand
- **WHEN** the user expands a directory for the first time
- **THEN** only that directory's immediate children are read and shown

#### Scenario: Directory without Markdown in MD-only mode
- **WHEN** a subdirectory contains no `.md` files and the tree is in MD-only mode
- **THEN** the subdirectory is still listed, and expanding it shows no entries

#### Scenario: Ignored directories in MD-only mode
- **WHEN** the folder contains `.git` or `node_modules` and the tree is in MD-only mode
- **THEN** those directories do not appear

#### Scenario: Empty subdirectory visible in Full mode
- **WHEN** a subdirectory contains no `.md` files at any depth and the tree is in Full mode
- **THEN** that subdirectory appears in the tree

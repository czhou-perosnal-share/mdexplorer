## ADDED Requirements

### Requirement: Ask before reopening the previous folder
When the application starts with a persisted last folder and no folder was supplied by the command line, it SHALL show a dialog offering "Open previous", "Choose another…" and "Not now" instead of loading the folder automatically. "Open previous" SHALL open the folder and restore its persisted tabs.

#### Scenario: Prompt shown at launch
- **WHEN** the app launches with a persisted last folder and no CLI folder
- **THEN** a dialog shows the previous folder path with the three choices and no folder is loaded yet

#### Scenario: Open previous
- **WHEN** the user chooses "Open previous"
- **THEN** the folder opens and previously open tabs and the active tab are restored

#### Scenario: Choose another
- **WHEN** the user chooses "Choose another…" and selects a folder
- **THEN** that folder opens with no tabs

#### Scenario: Not now
- **WHEN** the user chooses "Not now"
- **THEN** the dialog closes and no folder is open

### Requirement: Folders from CLI or menu skip the prompt
A folder supplied on the command line or chosen via File → Open Folder SHALL open directly and dismiss any startup prompt.

#### Scenario: CLI folder
- **WHEN** the app is launched with a folder argument
- **THEN** that folder opens without showing the prompt

### Requirement: Opening a folder is non-blocking
Opening a folder SHALL NOT block the UI; the tree lists only the first level and loads further levels on demand.

#### Scenario: Huge folder
- **WHEN** the user opens a folder containing a very large tree
- **THEN** the window stays responsive and the top-level entries appear without a full scan

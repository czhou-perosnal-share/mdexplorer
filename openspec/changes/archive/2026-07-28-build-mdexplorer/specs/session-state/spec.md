## ADDED Requirements

### Requirement: Remember last viewed document
The application SHALL persist the path of the last active document and restore it on next launch, automatically opening that file in the viewer.

#### Scenario: Last document restored on relaunch
- **WHEN** the user quits while viewing `docs/guide.md` and relaunches with the same folder
- **THEN** `docs/guide.md` is automatically opened and active on startup

#### Scenario: File no longer exists on relaunch
- **WHEN** the persisted last-viewed file no longer exists in the folder
- **THEN** the application launches without opening any file and shows the folder tree only

### Requirement: Remember scroll position per file
The application SHALL persist the scroll position (line offset) for each open file and restore it when that file is reopened.

#### Scenario: Scroll position restored
- **WHEN** the user scrolls to line 150 in `notes/readme.md`, closes the file, then reopens it
- **THEN** the viewer scrolls to line 150 automatically

#### Scenario: Scroll position cleared when file changes on disk
- **WHEN** the file has been modified since the scroll position was saved and its line count is now shorter than the saved position
- **THEN** the viewer scrolls to the last line of the file instead of the saved position

### Requirement: Remember open tabs across sessions
The application SHALL persist the list of all open tabs (file paths) and restore them on next launch.

#### Scenario: Multiple tabs restored
- **WHEN** the user has three files open in tabs and quits
- **THEN** on relaunch, all three files are reopened in tabs and the previously active tab is focused

#### Scenario: State file written on change
- **WHEN** the user opens a new file or switches tabs
- **THEN** the state file is updated immediately (not only on quit)

### Requirement: State file location follows platform conventions
The state file SHALL be stored at a platform-appropriate path:
- Linux/macOS: `~/.config/mdexplorer/state.json`
- Windows: `%APPDATA%\mdexplorer\state.json`

The directory SHALL be created automatically if it does not exist.

#### Scenario: State directory auto-created
- **WHEN** the application launches for the first time and no state directory exists
- **THEN** the directory is created and an empty state file is initialized without error

#### Scenario: Corrupt state file handled gracefully
- **WHEN** the state file contains invalid JSON
- **THEN** the application launches with a clean empty state and logs a warning; the corrupt file is renamed with a `.bak` extension

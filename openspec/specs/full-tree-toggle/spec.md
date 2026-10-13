## Purpose

Defines the toggle between the MD-only and the full (all files) folder tree modes.

## Requirements

### Requirement: Toggle between MD-only and full folder tree modes
The application SHALL provide a toggle control in the tree panel header that switches the folder tree between two display modes: **MD-only** (shows only `.md` files and directories containing `.md` files) and **Full** (shows all files and all directories, mirroring the real folder structure).

#### Scenario: Toggle to Full mode
- **WHEN** the user clicks the tree mode toggle while in MD-only mode
- **THEN** the tree re-renders showing all files and all directories in the folder

#### Scenario: Toggle back to MD-only mode
- **WHEN** the user clicks the tree mode toggle while in Full mode
- **THEN** the tree re-renders showing only `.md` files and directories that contain `.md` files

#### Scenario: Toggle state persists across restarts
- **WHEN** the user sets the tree mode to Full and closes the app
- **THEN** on next launch the tree opens in Full mode

### Requirement: Visual distinction for non-Markdown files in Full mode
In Full mode, non-Markdown files SHALL be visually distinct from `.md` files so that Markdown files remain easy to identify at a glance.

#### Scenario: Non-MD file appearance
- **WHEN** the tree is in Full mode and displays a non-Markdown file
- **THEN** that file item appears dimmed (reduced opacity) compared to `.md` files

#### Scenario: MD files retain normal appearance in Full mode
- **WHEN** the tree is in Full mode
- **THEN** `.md` file items appear at full opacity, identical to their appearance in MD-only mode

### Requirement: Open non-Markdown files with OS default program
In Full mode, double-clicking a non-Markdown file SHALL open it using the operating system's default program for that file type.

#### Scenario: Double-click opens non-MD file externally
- **WHEN** the user double-clicks a non-Markdown file in Full mode
- **THEN** the OS default program for that file type opens the file (e.g., `.pdf` opens in the default PDF viewer)

#### Scenario: Single-click on non-MD file does nothing
- **WHEN** the user single-clicks a non-Markdown file in Full mode
- **THEN** no file is opened in the viewer and no tab is created

#### Scenario: Double-click on MD file still opens in viewer
- **WHEN** the user double-clicks a `.md` file in Full mode
- **THEN** the file opens in the mdexplorer viewer tab (same behavior as single-click)

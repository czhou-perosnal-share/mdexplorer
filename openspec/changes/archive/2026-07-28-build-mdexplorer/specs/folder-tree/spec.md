## ADDED Requirements

### Requirement: Display recursive folder tree of Markdown files
The application SHALL accept a folder path as a CLI argument (or via a folder-open dialog) and display a recursive tree of all `.md` files within that folder in a left-side panel. If no path is provided, the application SHALL use the last-opened folder from session state, or prompt the user to open a folder.

#### Scenario: Launch with explicit folder argument
- **WHEN** the user launches the app with `mdexplorer /some/folder`
- **THEN** the tree panel lists all `.md` files under `/some/folder`, grouped by subdirectory

#### Scenario: Launch without arguments (previous folder known)
- **WHEN** the user launches the app with no path and session state contains a last folder
- **THEN** the tree panel lists all `.md` files in the last-used folder

#### Scenario: No Markdown files found
- **WHEN** the specified folder contains no `.md` files
- **THEN** the tree panel displays an empty state message: "No Markdown files found"

### Requirement: Filter tree to Markdown files only
The folder tree SHALL only display `.md` files and directories that contain at least one `.md` file (directly or recursively). Non-Markdown files and empty directories SHALL be hidden.

#### Scenario: Mixed content folder
- **WHEN** the folder contains `.md`, `.txt`, `.py`, and subdirectories
- **THEN** only `.md` files and directories containing `.md` files appear in the tree

#### Scenario: Empty subdirectory hidden
- **WHEN** a subdirectory contains no `.md` files at any depth
- **THEN** that subdirectory does not appear in the tree

### Requirement: Mouse and keyboard navigation in the tree
The user SHALL be able to navigate the folder tree using both the mouse and keyboard. Mouse click on a file SHALL open it in the viewer. Arrow keys (`↑`/`↓`) SHALL move focus between items, and `Enter` SHALL open the focused file.

#### Scenario: Mouse click opens file
- **WHEN** the user clicks a `.md` file item in the tree
- **THEN** the file opens in the viewer panel (new tab if not already open)

#### Scenario: Arrow key navigation
- **WHEN** the tree panel has focus and the user presses `↓`
- **THEN** focus moves to the next item in the tree

#### Scenario: Open file from tree with keyboard
- **WHEN** a `.md` file item is focused and the user presses `Enter`
- **THEN** the file opens in the viewer panel (new tab if not already open)

### Requirement: Expand and collapse directories
Directory nodes in the tree SHALL be expandable and collapsible via mouse click or `Enter` key. The tree SHALL start with all top-level directories expanded.

#### Scenario: Collapse a directory via mouse
- **WHEN** the user clicks an expanded directory node's toggle arrow
- **THEN** the directory collapses and its children are hidden

#### Scenario: Expand a directory via keyboard
- **WHEN** a collapsed directory is focused and the user presses `Enter`
- **THEN** the directory expands and its children become visible

### Requirement: Resizable tree panel
The user SHALL be able to drag the divider between the tree panel and the viewer panel to resize them. The split SHALL default to approximately 30% tree / 70% viewer.

#### Scenario: Drag to resize
- **WHEN** the user drags the panel divider left or right
- **THEN** the tree and viewer panels resize accordingly, with a minimum width of 150px for the tree

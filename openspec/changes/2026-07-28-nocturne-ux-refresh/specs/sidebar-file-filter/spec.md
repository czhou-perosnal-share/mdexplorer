## ADDED Requirements

### Requirement: Live file filter in the sidebar
The sidebar SHALL include a "Filter files…" text input as the topmost element in the sidebar, above both the "Files" header row and the folder tree. While the input contains text, the folder tree SHALL be replaced by a flat list showing only the files whose names match the filter query (case-insensitive substring match on filename). Clearing the input restores the normal expand/collapse tree view.

#### Scenario: Filter input is the topmost sidebar element
- **WHEN** the user opens a folder
- **THEN** a text input with placeholder "Filter files…" is visible at the very top of the sidebar, above the "Files" header row and the MD-only/All-files toggle

#### Scenario: Typing filters to a flat list
- **WHEN** the user types `read` into the filter input
- **THEN** the folder tree is replaced by a flat list containing only files whose filename includes `read` (case-insensitive, e.g. `README.md`, `reading-notes.md`); directory structure is not shown

#### Scenario: Filter is case-insensitive
- **WHEN** the user types `README`
- **THEN** files named `readme.md`, `README.md`, and `ReadMe.md` all appear in the results

#### Scenario: No matches shows empty state
- **WHEN** the filter query matches no files in the current folder
- **THEN** the flat list area shows an empty state message: `No files match "<query>"`

#### Scenario: Clearing the filter restores the tree
- **WHEN** the user clears the filter input (deletes all text)
- **THEN** the normal expand/collapse folder tree is restored in its previous state

#### Scenario: Filter applies regardless of expand/collapse state
- **WHEN** a matching file is inside a collapsed directory
- **THEN** it still appears in the filtered flat list

#### Scenario: Selecting a file from the filter results opens a tab
- **WHEN** the user clicks a Markdown file in the filtered flat list
- **THEN** the file opens in a tab, same as clicking it in the normal tree

### Requirement: Filter state is not persisted
The sidebar filter query is local UI state and SHALL NOT be persisted to session state. On app restart, the filter input is always empty and the tree shows the normal view.

#### Scenario: Filter cleared on relaunch
- **WHEN** the user has text in the filter input and quits the application
- **THEN** on next launch, the filter input is empty and the full tree is shown

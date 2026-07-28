## MODIFIED Requirements

### Requirement: Render full file contents without truncation
The viewer SHALL render Markdown files in their entirety regardless of file size. There is no line limit, no truncation banner, and no "truncated" indicator in the status bar.

#### Scenario: Large file renders completely
- **WHEN** a file has more than 10,000 lines
- **THEN** the full file content is rendered; no warning banner appears; the status bar shows the actual line count without any truncation indicator

### Requirement: Show file metadata in status bar
The application SHALL display the currently open file's relative path and total line count in a status bar at the bottom of the window. The line count SHALL be displayed as a small neutral pill tag.

#### Scenario: Status bar shows line count as a tag
- **WHEN** a file is open in the viewer
- **THEN** the status bar shows the relative path from the root folder and a pill-styled tag with the document's line count

## REMOVED Requirements

### Removed: Handle large files gracefully (truncation)
The previous requirement that files exceeding 10,000 lines be truncated with a warning banner is removed. Files render in full.

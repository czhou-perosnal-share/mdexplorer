## ADDED Requirements

### Requirement: Links to Markdown files open in tabs
Clicking a link in a rendered document that resolves to a `.md` file SHALL open it in a new tab, or activate its existing tab, without expanding or otherwise changing the folder tree. Relative links SHALL resolve against the current document's folder; a leading `/` SHALL resolve against the opened folder; `file:` URLs and absolute paths SHALL be supported; a link without extension SHALL fall back to `.md`. A target outside the opened folder SHALL be shown with its full path as the tab label path.

#### Scenario: Relative link
- **WHEN** the user clicks `[guide](../docs/guide.md)` in a document
- **THEN** `guide.md` opens in a tab and the Explorer tree is unchanged

#### Scenario: Link outside the folder
- **WHEN** the link target is outside the opened folder
- **THEN** it opens in a tab labelled with its file name and its full path

### Requirement: No duplicate tabs for the same file
A file SHALL never be open in more than one tab, regardless of whether it is opened from the tree, search, a link, or session restore. Path comparison SHALL be case-insensitive on Windows, and rapid repeated activations SHALL NOT create duplicates.

#### Scenario: Already open
- **WHEN** the user clicks a link to a file that already has a tab
- **THEN** that tab is activated and no new tab is created

#### Scenario: Different casing
- **WHEN** a link targets `Guide.MD` and `guide.md` is already open on Windows
- **THEN** the existing tab is activated

#### Scenario: Double click
- **WHEN** the user clicks the same link twice in quick succession
- **THEN** only one tab is created

### Requirement: Other link types
`http`, `https` and `mailto` links SHALL open in the system default handler. Links to existing non-Markdown local files SHALL open with the OS default program. `#heading` links SHALL scroll to the matching heading in the current document. A link whose target does not exist SHALL show "Link target not found: …" in the status bar. Other URL schemes SHALL be ignored.

#### Scenario: External URL
- **WHEN** the user clicks an `https://` link
- **THEN** it opens in the default browser and the app window does not navigate

#### Scenario: Missing target
- **WHEN** the link points to a file that does not exist
- **THEN** the status bar shows "Link target not found: <path>"

#### Scenario: In-page anchor
- **WHEN** the user clicks `[Install](#install)`
- **THEN** the viewer scrolls to the "Install" heading

### Requirement: App window never navigates
Clicking any link SHALL NOT navigate or open a new Electron window.

#### Scenario: Unsupported scheme
- **WHEN** the user clicks a link with an unsupported scheme
- **THEN** nothing happens and the document stays displayed

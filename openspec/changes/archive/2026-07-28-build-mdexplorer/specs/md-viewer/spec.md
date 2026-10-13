## ADDED Requirements

### Requirement: Render Markdown with visual styling
The viewer panel SHALL render Markdown files with styled formatting including headings (H1–H6), bold, italic, inline code, fenced code blocks with syntax highlighting, ordered and unordered lists, blockquotes, horizontal rules, and tables (GFM). The rendering SHALL convert Markdown to HTML using a well-established library (e.g., `marked`) and display it in a Chromium webview.

#### Scenario: Heading levels rendered distinctly
- **WHEN** a Markdown file contains H1 through H6 headings
- **THEN** each heading level is visually distinct in size or color

#### Scenario: Fenced code block with syntax highlighting
- **WHEN** a Markdown file contains a fenced code block with a language identifier (e.g., ` ```python `)
- **THEN** the code block is rendered with syntax-highlighted colors appropriate to that language

#### Scenario: Table rendering
- **WHEN** a Markdown file contains a GFM-style table
- **THEN** the table is rendered with aligned columns and visible borders

### Requirement: Scroll through document via mouse and keyboard
The viewer panel SHALL be scrollable via mouse wheel and keyboard. Keyboard keys `↑`/`↓` (line), `PgUp`/`PgDn` (page), and `Home`/`End` (document bounds) SHALL scroll the content.

#### Scenario: Mouse wheel scroll
- **WHEN** the viewer has focus and the user scrolls the mouse wheel
- **THEN** the document scrolls up or down accordingly

#### Scenario: Keyboard line scroll
- **WHEN** the viewer has focus and the user presses `↓`
- **THEN** the document scrolls down by one line

#### Scenario: Jump to document end
- **WHEN** the user presses `End`
- **THEN** the document scrolls to the last line

### Requirement: Show file metadata in status bar
The application SHALL display the currently open file's relative path and total line count in a status bar at the bottom of the window.

#### Scenario: Status bar content
- **WHEN** a file is open in the viewer
- **THEN** the status bar shows the relative path from the root folder and the document's line count

### Requirement: Handle large files gracefully
The viewer SHALL render files up to 10,000 lines without perceptible lag (< 500 ms to first render on modern hardware). Files exceeding 10,000 lines SHALL display a truncation warning banner but still render the first 10,000 lines.

#### Scenario: Large file truncation warning
- **WHEN** a file has more than 10,000 lines
- **THEN** a warning banner is shown above the content and only the first 10,000 lines are rendered

### Requirement: Render YAML frontmatter as a metadata table
If a Markdown file begins with a YAML frontmatter block — content enclosed between two `---` delimiter lines appearing as the very first lines of the file — the viewer SHALL strip that block from the Markdown source before rendering and display its key-value pairs as a styled two-column table (`Key | Value`) above the document body. This matches GitHub's visual treatment of frontmatter in Markdown files. Files without a frontmatter block SHALL be rendered unchanged.

Multi-line YAML values SHALL be rendered as a single collapsed string. Nested YAML objects and sequences SHALL be rendered as their raw serialized text form; no deep YAML parsing is required.

#### Scenario: File with frontmatter renders metadata table
- **WHEN** a Markdown file starts with a `---`-delimited YAML block
- **THEN** the viewer renders a `Key | Value` table above the document body, and the raw `---` block does not appear as visible text

#### Scenario: File without frontmatter is unaffected
- **WHEN** a Markdown file has no leading `---` block
- **THEN** no frontmatter table is shown and the document body renders normally

#### Scenario: Frontmatter with complex values does not crash
- **WHEN** the frontmatter contains nested keys, sequences, or multi-line strings
- **THEN** those values are rendered as their raw string representation; the table is still shown and no error occurs

### Requirement: Prevent XSS from Markdown content
The viewer SHALL NOT execute any scripts present in the rendered Markdown HTML. A Content Security Policy SHALL be enforced on the renderer.

#### Scenario: Script tag in Markdown blocked
- **WHEN** a Markdown file contains a `<script>` tag or inline event handler
- **THEN** the script is not executed; the tag may be rendered as escaped text or stripped

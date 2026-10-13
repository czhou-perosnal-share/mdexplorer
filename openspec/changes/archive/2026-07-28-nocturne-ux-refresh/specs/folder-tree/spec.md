## ADDED Requirements

### Requirement: Icon-forward tree item presentation
Directory nodes and file nodes in the folder tree SHALL use simple SVG line icons (not ASCII characters or emoji) to identify their type. Directory nodes display a folder icon. Markdown file nodes display a document icon. Non-Markdown file nodes (visible in Full mode) display the same document icon with a dimmed appearance and a neutral "bin" tag at the far right of the row.

#### Scenario: Directory node shows folder icon
- **WHEN** a directory node is rendered in the tree
- **THEN** it displays a folder SVG icon; clicking the row toggles its expand/collapse state

#### Scenario: Markdown file node shows document icon
- **WHEN** a `.md` file node is rendered in the tree
- **THEN** it displays a document SVG icon

#### Scenario: Non-Markdown file shows document icon and bin tag in Full mode
- **WHEN** the tree is in Full mode and a non-Markdown file is rendered
- **THEN** it displays a document SVG icon, appears dimmed (reduced opacity), and shows a small neutral "bin" tag at the far right of the row

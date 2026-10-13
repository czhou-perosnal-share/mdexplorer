# app-settings Specification

## Purpose
TBD - created by archiving change sidebar-search-lazy-tree-settings. Update Purpose after archive.
## Requirements
### Requirement: Settings dialog
The application SHALL provide a Settings dialog opened by File → Settings…, `Ctrl+,` or the activity-bar gear icon. It SHALL contain an "Interface theme" picker (swatches for Nocturne, Light, Graphite, High contrast) and a "Document theme" selector.

#### Scenario: Open via shortcut
- **WHEN** the user presses `Ctrl+,`
- **THEN** the Settings dialog opens

### Requirement: Interface theme applies to the app chrome
Selecting an interface theme SHALL immediately restyle the toolbar, activity bar, sidebar, tabs, status bar and dialogs through CSS custom properties, and SHALL be persisted and restored on next launch. Nocturne SHALL be the default. The interface theme SHALL NOT change the rendered document's theme.

#### Scenario: Switch to Light
- **WHEN** the user selects the Light swatch
- **THEN** the application chrome becomes light immediately and remains light after restart

#### Scenario: Independent document theme
- **WHEN** the interface theme is Light and the document theme is Dracula
- **THEN** the chrome is light and the document renders with the Dracula style

### Requirement: Document theme selectable in Settings
The document theme selector in Settings SHALL set the same persisted document theme as the toolbar selector.

#### Scenario: Change in Settings
- **WHEN** the user picks Nord in Settings
- **THEN** the document renders with Nord and the toolbar selector shows Nord


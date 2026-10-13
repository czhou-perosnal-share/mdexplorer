# sidebar-navigation Specification

## Purpose
TBD - created by archiving change sidebar-search-lazy-tree-settings. Update Purpose after archive.
## Requirements
### Requirement: Activity bar with sidebar views
The application SHALL display a vertical activity bar at the left edge containing an Explorer icon, a Search icon, and a Settings (gear wheel) icon at the bottom. Selecting Explorer or Search SHALL show that view in the resizable sidebar panel.

#### Scenario: Switch view
- **WHEN** the user clicks the Search icon while Explorer is shown
- **THEN** the sidebar shows the Search view and the Search icon is marked active

#### Scenario: Settings icon
- **WHEN** the user clicks the gear icon
- **THEN** the Settings dialog opens

### Requirement: Collapsible sidebar
Clicking the icon of the currently active view SHALL collapse the sidebar; clicking any view icon while collapsed SHALL expand it with that view.

#### Scenario: Collapse and expand
- **WHEN** the user clicks the active Explorer icon
- **THEN** the sidebar collapses; clicking Explorer again expands it

### Requirement: Views keep their state
The Explorer and Search views SHALL remain mounted when hidden so that expanded folders, search text and running or finished search results persist when switching views.

#### Scenario: Search continues in background
- **WHEN** a search is running and the user switches to Explorer
- **THEN** the search continues and its results are present when the user returns to Search

### Requirement: Search keyboard shortcut
`Ctrl+Shift+F` SHALL open the Search view and focus its input.

#### Scenario: Shortcut
- **WHEN** the user presses `Ctrl+Shift+F`
- **THEN** the sidebar expands showing Search with the input focused


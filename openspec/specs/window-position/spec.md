# window-position Specification

## Purpose
TBD - created by archiving change sidebar-search-lazy-tree-settings. Update Purpose after archive.
## Requirements
### Requirement: Restore window position only when visible
On launch the application SHALL use the saved window position only if the saved window rectangle overlaps a connected display's work area by at least 100 px horizontally and 50 px vertically. Otherwise the saved size SHALL still be applied and the window SHALL be centered on the primary display.

#### Scenario: Saved position on a disconnected display
- **WHEN** the window was last closed on a second monitor that is no longer connected
- **THEN** the window opens centered on the primary display with its previous size

#### Scenario: Saved position still visible
- **WHEN** the saved position lies on a connected display
- **THEN** the window opens at the saved position and size

### Requirement: Do not persist bounds of non-normal windows
The application SHALL NOT save window bounds while the window is minimized, maximized or fullscreen.

#### Scenario: Minimized window
- **WHEN** the user minimizes the window and then quits
- **THEN** the previously saved normal bounds are kept


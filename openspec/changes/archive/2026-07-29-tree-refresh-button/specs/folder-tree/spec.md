## MODIFIED Requirements

### Requirement: Files header row controls
The sidebar Files header row SHALL contain, from left to right: the "Files" label, the refresh icon button, and the MD-only/All-files toggle button. The refresh button SHALL be visually separated from the label and styled as a ghost icon button consistent with the Nocturne design system.

#### Scenario: Files header row layout
- **WHEN** a folder is open
- **THEN** the header row shows the "Files" label on the left, the refresh button and MD-only/All-files toggle on the right

#### Scenario: MD-only toggle shows loading overlay during rescan
- **WHEN** the user clicks the MD-only/All-files toggle
- **THEN** the tree mode switches, a loading overlay appears over the tree content area while the rescan runs, and the overlay disappears once the new tree is rendered

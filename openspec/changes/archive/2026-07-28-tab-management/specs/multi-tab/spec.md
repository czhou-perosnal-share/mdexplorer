## MODIFIED Requirements

### Requirement: Tab title shows filename with disambiguation
Each tab header SHALL display the filename (not the full path) when the filename is unique across all open tabs. When two or more open tabs share the same filename, ALL affected tabs SHALL display the nearest distinguishing parent folder segment prepended (e.g. `api/README.md` and `guide/README.md`). The full relative path SHALL appear as a tooltip on hover and in the status bar when the tab is active.

#### Scenario: Tab label shows filename only when unique
- **WHEN** a file at `docs/api/reference.md` is open and no other open tab is named `reference.md`
- **THEN** the tab header shows `reference.md`

#### Scenario: Tab label disambiguates duplicate filenames
- **WHEN** both `api/README.md` and `guide/README.md` are open
- **THEN** the first tab shows `api/README.md` and the second shows `guide/README.md`

#### Scenario: Disambiguation updates when duplicate is closed
- **WHEN** two tabs both showing `api/README.md` / `guide/README.md` are open and the user closes `guide/README.md`
- **THEN** the remaining tab reverts to showing `README.md` (no longer needs disambiguation)

#### Scenario: Full path in status bar
- **WHEN** a tab is active
- **THEN** the status bar shows the full relative path (e.g. `docs/api/reference.md`)

#### Scenario: Tooltip shows full path
- **WHEN** the user hovers over a tab header
- **THEN** a tooltip shows the full relative path of that file

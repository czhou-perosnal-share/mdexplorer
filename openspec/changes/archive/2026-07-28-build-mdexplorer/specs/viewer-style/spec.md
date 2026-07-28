## ADDED Requirements

### Requirement: Built-in viewer themes
The application SHALL ship with at least four built-in visual themes: `github`, `nord`, `dracula`, and `plain`. Themes SHALL affect syntax highlighting colors, heading colors, background color, link colors, and general text contrast.

#### Scenario: List available themes
- **WHEN** the user opens the View menu or the theme selector in the toolbar
- **THEN** the available themes are listed by name

#### Scenario: Theme applied immediately
- **WHEN** the user selects a theme
- **THEN** the viewer panel updates its visual style immediately without requiring a restart or file reload

### Requirement: Persist selected theme across sessions
The selected theme SHALL be saved to session state and restored on the next launch.

#### Scenario: Theme persists after restart
- **WHEN** the user selects the `nord` theme and quits the application
- **THEN** on next launch, the `nord` theme is active

#### Scenario: Default theme on first launch
- **WHEN** no session state exists (first launch)
- **THEN** the `github` theme is used as the default

### Requirement: Theme selection via View menu and toolbar
The user SHALL be able to change the theme via the native application **View** menu (under "Theme") or a dropdown in the toolbar. No keyboard-only overlay is required.

#### Scenario: Change theme from View menu
- **WHEN** the user opens the View menu and selects a theme under the "Theme" submenu
- **THEN** the selected theme is applied immediately

#### Scenario: Change theme from toolbar dropdown
- **WHEN** the user opens the theme dropdown in the toolbar and selects a theme
- **THEN** the selected theme is applied immediately

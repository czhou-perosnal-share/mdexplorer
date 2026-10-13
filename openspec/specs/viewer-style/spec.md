## Purpose

Defines the document (content) themes and how the chosen theme is applied and persisted.
## Requirements
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

### Requirement: Scoped content theme (replaces whole-app theme)
The application SHALL provide a `contentTheme` selector in the nav bar that controls the visual style of the **Markdown document pane only**. The app chrome (toolbar, sidebar, tabs, status bar) SHALL always use the fixed Nocturne dark design system, regardless of the selected content theme. There is no user-facing chrome theme choice.

The available content themes are: **Nocturne** (default), **Github**, **Nord**, **Dracula**, **Plain**. Nocturne inherits the dark chrome background and uses a near-neutral text palette.

#### Scenario: Content theme selector is in the nav bar
- **WHEN** the user opens the application
- **THEN** a content theme `<select>` is visible in the nav bar (not inside the tab strip) with options: Nocturne, Github, Nord, Dracula, Plain

#### Scenario: Changing content theme only re-themes the document pane
- **WHEN** the user selects "Github" from the content theme selector
- **THEN** the Markdown document area switches to a white background with dark text; the toolbar, sidebar, tabs, and status bar remain unchanged (Nocturne dark)

#### Scenario: App chrome is always Nocturne dark
- **WHEN** any content theme is active
- **THEN** the toolbar background is `#161826`, sidebar background is `#161826`, and accent color is `#9184d9`

#### Scenario: Content theme applied immediately
- **WHEN** the user selects a content theme
- **THEN** the document pane updates its visual style immediately without requiring a file reload

#### Scenario: Content theme applies to all open tabs
- **WHEN** the user has multiple tabs open and changes the content theme
- **THEN** the document pane displays the new theme regardless of which tab is active; switching tabs does not revert the theme

### Requirement: Persist content theme across sessions
The selected `contentTheme` SHALL be saved to session state and restored on the next launch.

#### Scenario: Content theme persists after restart
- **WHEN** the user selects the `nord` content theme and quits the application
- **THEN** on next launch, the `nord` content theme is active in the document pane

#### Scenario: Default content theme on first launch
- **WHEN** no session state exists (first launch)
- **THEN** the `nocturne` content theme is used as the default


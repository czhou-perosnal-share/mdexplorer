## ADDED Requirements

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

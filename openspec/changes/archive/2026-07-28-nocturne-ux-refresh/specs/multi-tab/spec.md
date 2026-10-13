## ADDED Requirements

### Requirement: Pill-style tab presentation with accent underline
Tab items in the tab bar SHALL use a pill shape (`border-radius: 4px`) and indicate the active tab via a 2px accent-colored underline (`#9184d9`) rather than a filled background color. The inactive tab hover state uses a subtle dark background tint.

#### Scenario: Active tab has accent underline
- **WHEN** a tab is the currently active tab
- **THEN** it displays a 2px solid accent-colored (`#9184d9`) underline at the bottom of the pill; the pill background is not filled

#### Scenario: Inactive tab hover shows tint
- **WHEN** the user hovers over an inactive tab
- **THEN** the tab pill receives a subtle dark background tint (`--color-neutral-800`)

### Requirement: Always-visible close button at reduced opacity
The close button (×) on each tab SHALL be visible at reduced opacity (`0.6`) at all times and SHALL reach full opacity (`1`) when the user hovers directly over the close button itself.

#### Scenario: Close button visible on all tabs
- **WHEN** any tab is rendered
- **THEN** the close button is visible at `opacity: 0.6`

#### Scenario: Close button fully visible on direct hover
- **WHEN** the user moves the pointer directly over the close button
- **THEN** the close button is fully opaque (opacity 1)

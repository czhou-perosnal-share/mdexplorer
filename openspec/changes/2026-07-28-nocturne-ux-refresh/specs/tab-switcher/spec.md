## MODIFIED Requirements

### Requirement: Tab switcher overlay uses Nocturne chrome variables
The tab switcher overlay (backdrop and modal card) SHALL use the Nocturne dark design system tokens for its background, border, text, and accent colors, consistent with the rest of the app chrome.

#### Scenario: Overlay backdrop uses dark tokens
- **WHEN** the tab switcher overlay is open
- **THEN** the backdrop has a semi-transparent dark background; the modal card uses `--color-bg` as its background, `--color-neutral-700` as its border, and `--color-neutral-200` as its text color

#### Scenario: Selected item uses accent color
- **WHEN** an item in the tab switcher list is highlighted (keyboard navigation or hover)
- **THEN** it is highlighted using the accent color (`#9184d9`) as the selection background or left-border indicator

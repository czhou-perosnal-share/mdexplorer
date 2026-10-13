## Why

The project root and `src/` directory are cluttered with misplaced entry files and loose scripts that belong in subdirectories. Entry points (`src/main.ts`, `src/preload.ts`, `src/renderer.tsx`) and global CSS (`src/index.css`) sit directly in `src/` while their related implementation code lives in `src/main/` and `src/renderer/` — a mismatch that makes the source layout confusing. Dev scripts and design artifacts also litter the project root without a home.

## What Changes

- Move `src/main.ts` → `src/main/index.ts` (main process entry colocated with its module)
- Move `src/preload.ts` → `src/preload/index.ts` (preload isolated in its own directory)
- Move `src/renderer.tsx` → `src/renderer/index.tsx` (renderer entry inside its own tree)
- Move `src/index.css` → `src/renderer/index.css` (chrome CSS colocated with renderer)
- Move `reinstall.ps1` → `scripts/reinstall.ps1` (dev scripts consolidated)
- Move `design_handoff_mdexplorer_ux/` → `docs/design-handoff/` (reference docs out of root)
- Move `vite.main.config.ts`, `vite.preload.config.ts`, `vite.renderer.config.ts`, `vite.test.config.ts` → `config/` (build config files grouped away from root)
- Update all references: `forge.config.ts`, `index.html`, import paths in moved files

## Capabilities

### New Capabilities

_None — this is a structural refactor with no user-facing behavior changes._

### Modified Capabilities

_None — no spec-level requirement changes. Implementation paths change but all behaviors stay identical._

## Impact

- `forge.config.ts`: entry paths and config file paths updated
- `index.html`: renderer script src updated
- `src/renderer/index.tsx`: CSS import path updated
- `src/main/index.ts`: no content changes, path only
- `src/preload/index.ts`: no content changes, path only
- `vite.test.config.ts` (now `config/vite.test.config.ts`): `package.json` test script updated if needed
- `scripts/reinstall.ps1`: path change only, no content changes
- `docs/design-handoff/`: path change only
- No runtime behavior changes; no dependency changes

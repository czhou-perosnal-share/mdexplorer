## Context

The project uses electron-forge with the Vite plugin. Entry points for the three Electron processes (main, preload, renderer) are declared in `forge.config.ts` and `index.html`. Currently all three entry files live at `src/` root alongside `src/index.css`, while their companion code lives in `src/main/` and `src/renderer/`. Four Vite config files and a dev script (`reinstall.ps1`) also sit at the project root.

## Goals / Non-Goals

**Goals:**
- Colocate each entry file inside its own subdirectory (`src/main/`, `src/preload/`, `src/renderer/`)
- Move all Vite build configs into a `config/` directory
- Move dev scripts into `scripts/` and reference docs into `docs/`
- Keep all existing behavior identical — no logic changes

**Non-Goals:**
- Refactoring component or module internals
- Changing any runtime behavior, IPC contracts, or UI
- Updating CI/CD pipelines or deployment workflows

## Decisions

### 1 — Rename entry files to `index.*` inside their directory

`src/main.ts` → `src/main/index.ts`, `src/preload.ts` → `src/preload/index.ts`, `src/renderer.tsx` → `src/renderer/index.tsx`.

Using `index` as the filename follows Node/Vite convention and makes the directory the addressable unit. Alternative (keeping original names, e.g. `src/main/main.ts`) is redundant and non-standard.

### 2 — Move Vite configs to `config/`

`vite.main.config.ts`, `vite.preload.config.ts`, `vite.renderer.config.ts`, `vite.test.config.ts` → `config/`. References in `forge.config.ts` and `package.json` (vitest) updated. This clears four files from the root. Risk is low — these files contain almost no logic.

### 3 — Move `src/index.css` to `src/renderer/index.css`

The chrome CSS is renderer-only. Moving it inside `src/renderer/` is consistent with keeping all renderer assets together. The single import in `src/renderer/index.tsx` is updated accordingly.

### 4 — Move `reinstall.ps1` to `scripts/`

`scripts/gen-icon.mjs` already exists; `reinstall.ps1` belongs there. No content changes; the `README.md` reference (if any) is updated.

### 5 — Move `design_handoff_mdexplorer_ux/` to `docs/design-handoff/`

Reference-only artifacts belong in `docs/`. The directory name is simplified.

## Risks / Trade-offs

- **forge.config.ts entry paths**: Must be updated before `npm start` or `npm run make` will work. Easy to verify with a local build.
- **`index.html` script src**: Must be updated from `/src/renderer.tsx` → `/src/renderer/index.tsx`. Missed update breaks the renderer silently.
- **Vitest config path**: `package.json` test script references the vite test config by path; must update after moving to `config/`.
- **Git history continuity**: Renames preserve history with `git mv`; `git log --follow` still works.

## Migration Plan

1. `git mv` each file to its new location
2. Update `forge.config.ts` entry and config paths
3. Update `index.html` renderer script src
4. Update CSS import in `src/renderer/index.tsx`
5. Update `package.json` test script if it references `vite.test.config.ts` directly
6. Verify: `npm start` launches the app; `npm test` passes
7. Commit all changes in one atomic commit

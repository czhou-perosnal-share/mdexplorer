## 1. Move entry files into their subdirectories

- [x] 1.1 `git mv src/main.ts src/main/index.ts`
- [x] 1.2 `git mv src/preload.ts src/preload/index.ts`
- [x] 1.3 `git mv src/renderer.tsx src/renderer/index.tsx`
- [x] 1.4 `git mv src/index.css src/renderer/index.css`

## 2. Move build config files to `config/`

- [x] 2.1 `git mv vite.main.config.ts config/vite.main.config.ts`
- [x] 2.2 `git mv vite.preload.config.ts config/vite.preload.config.ts`
- [x] 2.3 `git mv vite.renderer.config.ts config/vite.renderer.config.ts`
- [x] 2.4 `git mv vite.test.config.ts config/vite.test.config.ts`

## 3. Move dev scripts and docs

- [x] 3.1 `git mv reinstall.ps1 scripts/reinstall.ps1`
- [x] 3.2 `git mv design_handoff_mdexplorer_ux docs/design-handoff`

## 4. Update all references

- [x] 4.1 Update `forge.config.ts`: entry paths (`src/main.ts` → `src/main/index.ts`, `src/preload.ts` → `src/preload/index.ts`) and config paths (`vite.main.config.ts` → `config/vite.main.config.ts`, `vite.preload.config.ts` → `config/vite.preload.config.ts`, `vite.renderer.config.ts` → `config/vite.renderer.config.ts`)
- [x] 4.2 Update `index.html`: script src from `/src/renderer.tsx` → `/src/renderer/index.tsx`
- [x] 4.3 Update `src/renderer/index.tsx`: CSS import from `../index.css` → `./index.css` (also fixed `App` import from `./renderer/App` → `./App`)
- [x] 4.4 Update `package.json` test script: `--config vite.test.config.ts` → `--config config/vite.test.config.ts`

## 5. Verify

- [x] 5.1 Run `npm test` — all tests pass (20/20)
- [x] 5.2 Run `npm start` — app launches without errors

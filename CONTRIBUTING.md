# Contributing to MdExplorer

Thanks for helping out! Issues and pull requests are welcome. This guide covers setup and the workflow. For how the code is organized, read [docs/TECH.md](docs/TECH.md) first.

## Getting set up

Requirements: Node.js and npm (developed with Node 24 and npm 11) and Git. See [Development environment](docs/TECH.md#development-environment) for the full list of tested versions.

```bash
git clone git@github.com:czhou-perosnal-share/mdexplorer.git
cd mdexplorer
npm install
npm start          # run the app in development mode
```

| Command | What it does |
|---|---|
| `npm start` | Run in development mode |
| `npm test` | Run unit tests (Vitest) |
| `npx tsc --noEmit -p .` | Type-check (ignore errors that come from `node_modules`) |
| `npm run make` | Build an installer into `out/make/` |
| `npm run package` | Build an unpacked app into `out/` |
| `scripts/reinstall.ps1` | Windows only: build, uninstall the old version and install the new one |

Settings are stored in `%APPDATA%\mdexplorer\config.json` (see [docs/TECH.md](docs/TECH.md#persisted-state) for other platforms). Delete it to start from a clean state.

## Workflow

1. Branch from `main`, for example `feat/search-regex` or `fix/tab-duplicates`.
2. Make a focused change. Keep unrelated cleanups in separate commits.
3. Make sure the type-check and `npm test` pass, and try the change in the running app.
4. Open a pull request against `main` and describe what changed and why.

Small documentation fixes can go straight to `main`.

### Commit messages

Use a short imperative summary (about 70 characters), followed by a body when the "why" is not obvious.

```
Open linked Markdown files in deduplicated tabs

Links to .md files now open in a tab without touching the folder tree.
Tabs are matched by a case-insensitive path on Windows.
```

## Changing behavior: use OpenSpec

User-visible behavior is specified with [OpenSpec](https://github.com/Fission-AI/OpenSpec) in `openspec/`:

- `openspec/specs/` is the current, agreed behavior of each capability.
- `openspec/changes/<name>/` holds a proposal, design, spec changes and tasks for work in progress.
- `openspec/changes/archive/` holds finished changes.

For a new feature or a behavior change, create a change (`openspec new change "<name>"`, or `/opsx:propose` in Claude Code), keep its tasks up to date while you work, and archive it when done (`openspec archive <name>`). Pure bug fixes and refactors that do not change behavior do not need one.

## Scope

MdExplorer is a focused, read-only Markdown viewer. Before proposing a feature, check it against the principles in [docs/PRODUCT.md](docs/PRODUCT.md): features that help reading and presenting are welcome, while editing, sync, publishing and plugins are out of scope.

## Code guidelines

- **TypeScript and React.** Function components and hooks. Match the style of the surrounding code (naming, comment density, formatting).
- **Keep the renderer sandboxed.** The renderer must not use Node APIs. Add new file-system or OS access as an IPC handler in `src/main/index.ts` and expose it in `src/preload/index.ts` (and its `ElectronAPI` type).
- **Never block the main process.** Use `fs.promises` and `await` instead of `*Sync` calls, and stream results for long work.
- **Themes.** UI colors come from the CSS tokens in `src/renderer/index.css` (for example `--color-neutral-700`, `--color-accent`). Do not hard-code colors, so all four interface themes keep working. Document themes live in `src/renderer/themes/` and must not be imported statically in `index.tsx`.
- **Dependencies.** Use `~` ranges (patch updates only, for example `~19.2.7`) because the lockfile is not committed; `electron` is pinned exactly. Do not upgrade `electron-store` (v8) or `@vitejs/plugin-react` (v4) to ESM-only majors. See [pinned versions](docs/TECH.md#pinned-versions).
- **Tests.** Put unit tests in `src/tests/`. Pure logic (path handling, tab logic, Markdown rendering) should be covered.

## Reporting bugs and ideas

Open an issue with the steps to reproduce, what you expected, what happened, your OS, and the app version. For a UI problem, a screenshot helps. For a feature idea, describe the problem you want to solve before the solution.

## License

By contributing you agree that your contribution is licensed under the [MIT License](LICENSE).

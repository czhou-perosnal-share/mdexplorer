# Product positioning

Why MdExplorer exists, who it is for, and what each claim in the README's "Why MdExplorer" section is based on. Keep this file in sync when you change the README claims or the features behind them.

## Purpose

MdExplorer has one job: **open a folder and read its Markdown files.** It is for people who only need to read and present Markdown, not edit it. There are many projects called "mdexplorer" on GitHub, so this document also defines what makes this one different: it is deliberately small and read-only.

## Principles

1. **Read and present, nothing else.** Features that serve reading (navigation, search, links, themes) are in scope. Editing, note management, sync, publishing and plugins are out of scope.
2. **Never touch the user's files.** The app is read-only. Only its own settings file is written.
3. **Stay light.** No accounts, cloud, database or plugin system.
4. **Stay fast on large folders.** Never block the UI; load on demand.

A proposed feature should be checked against these principles before it is accepted.

## How the README claims map to the app

The README presents these as a "what you need / what MdExplorer delivers" table.

| README claim | What it rests on | Where to check |
|---|---|---|
| **Get to the content fast.** Folders load only when opened; large trees stay responsive. | Lazy, per-directory listing with async I/O. | `openspec/specs/folder-tree`, `list-dir` in `src/main/index.ts` |
| **Find the right page.** Background search of names and contents; keep reading while results arrive. | Streaming, cancellable, Markdown-only search. | `openspec/specs/file-search`, `src/renderer/components/SearchPanel.tsx` |
| **Follow the story across documents.** Links open in tabs, never twice for the same file. | Link resolution in the main process and de-duplicated tabs. | `openspec/specs/document-links` |
| **Present with confidence.** Consistent rendering and polished themes. | Four interface themes (Nocturne, Light, Graphite, High contrast) and five document themes. | `openspec/specs/app-settings`, `openspec/specs/viewer-style` |
| **Zero risk to your files.** Strictly read-only. | The app has no code that writes, renames or deletes user files. | Search `src/main/index.ts` for `writeFile`, `unlink`, `rename` (there are none) |
| **No overhead.** No accounts, cloud, subscription, database or plugins. | The app has none of these. | `package.json` dependencies |

## Claims that are not fully proven yet

Be honest in the README. These are the claims to be careful with:

- **Speed on very large folders.** The design avoids blocking (lazy loading, async I/O, background search), but the app has not been benchmarked or manually verified on a very large folder. This is the open task 7.2 in the archived change `sidebar-search-lazy-tree-settings`. Until it is done, the README says "stay responsive", not "instant".
- **"Light".** This refers to features and the interface. The app is built on Electron, so its installer and memory use are not small, and no numbers have been measured. Do not claim size or memory figures without measuring them.
- **Platforms.** The app has only been built and run on Windows. macOS and Linux builds are configured but untested.

## Wording guidelines for the README

- Lead with the benefit to the reader, then name the feature behind it.
- Only claim what the table above can back up. If a new claim is added, add a row here with its evidence.
- Keep the English and Chinese READMEs in step.
- Prefer "stays responsive" over absolute words like "instant" unless it has been measured.

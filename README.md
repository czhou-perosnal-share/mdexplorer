<div align="center">

<img src="assets/icon.png" alt="MdExplorer" width="96" height="96" />

# MdExplorer

### Read your Markdown folders. Beautifully. Safely. Without the clutter.

A fast, VS Code-style viewer for the docs already sitting in your folders. No editor, no setup, no risk to your files.

⚡ Fast on huge folders &nbsp;·&nbsp; 🔎 Background search &nbsp;·&nbsp; 🔗 Smart links &nbsp;·&nbsp; 🎨 9 themes &nbsp;·&nbsp; 🔒 Read-only

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Electron](https://img.shields.io/badge/Electron-43-47848F?logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)

**English** · [简体中文](README.zh-CN.md)

</div>

<p align="center">
  <img src="docs/images/mdexplorer-main-window.png" alt="MdExplorer main window: folder tree, tabs and a rendered Markdown document" width="900" />
</p>

---

## ⚡ Try it in a minute

```bash
git clone git@github.com:czhou-perosnal-share/mdexplorer.git
cd mdexplorer
npm install
npm start
```

Then press `Ctrl+O` and pick any folder with Markdown files. Want a real installer instead? See [Build and install](#build-and-install).

## 🎯 Why MdExplorer

> **Your documentation, ready to read in seconds. Nothing to set up. Nothing to get in the way.**

Teams keep specs, runbooks, design notes and knowledge bases as Markdown in folders. Reading them usually means launching a heavyweight editor, a note-taking suite, or a web service, and paying for features you never use. (And yes, there are many projects named "mdexplorer" on GitHub. This one does one thing, and does it well.)

MdExplorer is built for the person who just needs to **read and present**.

| What you need | What MdExplorer delivers | How it works |
|---|---|---|
| ⚡ **Get to the content fast** | Point it at a folder and start reading. Folders load only when you open them, so even very large documentation trees stay responsive. | A lazy folder tree reads one directory level at a time, with all file access running in the background so the window never freezes. |
| 🔎 **Find the right page** | Search across file names and contents, and keep reading while results arrive. | The search runs in the background, streams results as it finds them, can be stopped at any time, and covers Markdown files only. |
| 🔗 **Follow the story across documents** | Click a link and the target opens in a tab, never twice. Jump back and forth without losing your place. | Links to other `.md` files open (or re-activate) a tab without touching the folder tree. Web links open in your browser. |
| 🎨 **Present with confidence** | Clean, consistent rendering with polished themes: Nocturne, Light, Graphite and High contrast. | The interface theme and the document theme are separate settings (**File → Settings**, `Ctrl+,`), so you can mix them. |
| 🔒 **Zero risk to your files** | Strictly read-only. MdExplorer never modifies, moves or deletes anything. | The app contains no code that writes to your documents. It only saves its own settings (last folder, tabs, theme). |
| 🪶 **No overhead** | No accounts, no cloud, no subscription, no database, no plugins to maintain. | Everything runs locally in one window. |

### Built to be focused, not feature-rich

We say "no" to editing, note management, sync, publishing and plugins, on purpose. Fewer moving parts means less to learn, less to maintain and less that can go wrong. Need to write? Keep your favorite editor open and let MdExplorer be the reader next to it.

## ✨ Features

| | |
|---|---|
| ⚡ **Instant open, lazy tree** | Only one folder level is read at a time, when you expand it. Huge folders never freeze the UI. |
| 🔎 **Background search** | Search Markdown file names, or file contents too. Results stream in, you can stop it any time, and you keep working while it runs. |
| 🗂️ **VS Code-style sidebar** | Activity bar with Explorer, Search and Settings. Click the active icon to collapse the sidebar. |
| 📑 **Multi-tab reading** | Many documents at once, tab context menu, and a quick tab switcher (`Ctrl+Shift+E`). |
| 🔗 **Smart links** | Links to other `.md` files open in a tab (never twice for the same file) without touching the tree. External links open in your browser. |
| 🎨 **Two kinds of themes** | Interface: Nocturne, Light, Graphite, High contrast. Document: Nocturne, GitHub, Nord, Dracula, Plain. |
| 🧠 **Remembers your session** | Last folder, open tabs, active tab, scroll positions, window size and themes. You are asked before the previous folder is reopened. |
| 🖥️ **Multi-monitor safe** | If the window was last on a monitor you disconnected, it reopens on your primary display. |
| 📝 **Rich Markdown** | Syntax-highlighted code, tables, blockquotes, GitHub-flavored Markdown and a YAML front-matter table. Embedded scripts are stripped. |

## 🚀 Getting started

### Build and install

There is no prebuilt download yet, so you build the installer yourself. You must build on the operating system you are targeting (installers cannot be cross-built).

```bash
# 1. Get the code
git clone git@github.com:czhou-perosnal-share/mdexplorer.git
cd mdexplorer

# 2. Install dependencies
npm install

# 3. Build the installer / package for your current OS
npm run make
```

The result is written to `out/make/`:

| Platform | Output | How to install |
|---|---|---|
| Windows | `out/make/squirrel.windows/x64/MdExplorer-<version> Setup.exe` | Run it. It installs silently (no wizard) to `%LOCALAPPDATA%\MdExplorer` and adds Start menu and desktop shortcuts. |
| macOS | `out/make/zip/darwin/<arch>/MdExplorer-darwin-<arch>-<version>.zip` | Unzip and drag `MdExplorer.app` to `Applications`. |
| Linux (Debian/Ubuntu) | `out/make/deb/<arch>/*.deb` | `sudo dpkg -i <file>.deb` |
| Linux (Fedora/RHEL) | `out/make/rpm/<arch>/*.rpm` | `sudo rpm -i <file>.rpm` |

Linux builds additionally need the packaging tools on the build machine (`dpkg` and `fakeroot` for `.deb`, `rpmbuild` for `.rpm`).

Want to try the app without installing? Run `npm start` for a development window, or `npm run package` to produce an unpacked app in `out/` that you can launch directly.

To update, pull the latest code, run `npm run make` again and re-run the installer. On Windows, `scripts/reinstall.ps1` does all of this in one step: build, uninstall the old version and install the new one.

### Open a folder

- Use **File → Open Folder…** (`Ctrl+O`) or the **Open Folder** button, or
- start the app with a folder argument:

```bash
mdexplorer /path/to/docs
```

## ⌨️ Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+O` | Open folder |
| `Ctrl+,` | Settings |
| `Ctrl+Shift+F` | Search files |
| `Ctrl+Shift+E` | Tab switcher |
| `Ctrl+Tab` / `Ctrl+Shift+Tab` | Next / previous tab |
| `Ctrl+W` | Close active tab |
| `F5` | Refresh the folder tree |
| `↑` `↓` / `k` `j` | Navigate the tree, or scroll the document |
| `←` `→` | Collapse / expand the selected folder |
| `PgUp` `PgDn` · `Home` `End` | Page scroll · document start / end |
| `Enter` | Open file / toggle folder |
| `?` | Show the shortcut list |
| `Ctrl+Q` | Quit |

## 🛠️ Development

Requirements: Node.js and npm (developed with Node 24 and npm 11) and Git. See [Development environment](docs/TECH.md#development-environment) for the full list of tested versions.

```bash
npm install
npm start          # run in development mode
npm test           # unit tests (Vitest)
npm run make       # build an installable package into out/make
```

**Tech stack:** Electron + [Electron Forge](https://www.electronforge.io/) (Vite plugin), React 19, TypeScript, `marked`, `highlight.js`, `electron-store`.

```
src/
├── main/       # Electron main process: file listing, search, link resolution, state store
├── preload/    # Safe IPC bridge exposed to the renderer
└── renderer/   # React UI: sidebar, tree, search, tabs, viewer, themes
openspec/       # Specs and change history (OpenSpec)
```

> **Dependency note:** `electron-store@8`, `@vitejs/plugin-react@4` are pinned on purpose — newer majors are ESM-only and break the Vite CommonJS main-process build.

## 💾 Where settings are stored

| Platform | Path |
|---|---|
| Windows | `%APPDATA%\mdexplorer\config.json` |
| macOS | `~/Library/Application Support/mdexplorer/config.json` |
| Linux | `~/.config/mdexplorer/config.json` |

## 🤝 Contributing

Issues and pull requests are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow, and [docs/TECH.md](docs/TECH.md) for the tech stack, folder structure and architecture. Behavior changes are tracked as OpenSpec changes under [`openspec/`](openspec/).

## 📄 License

[MIT](LICENSE) © 2026 czhou-perosnal-share

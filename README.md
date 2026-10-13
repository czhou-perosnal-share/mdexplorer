# MdExplorer

A fast, lightweight GUI Markdown file browser built with Electron + React + TypeScript.

## Features

- **Folder tree** — browse any folder; shows only `.md` files grouped by directory
- **Styled Markdown rendering** — headings, code blocks with syntax highlighting, tables, blockquotes
- **Multi-tab viewer** — open multiple files simultaneously; switch with `Ctrl+Tab`
- **Session persistence** — remembers last folder, open tabs, and scroll positions
- **Themes** — GitHub, Nord, Dracula, Plain (switch via View menu or toolbar)

## Install

Download the latest release for your OS from the Releases page:
- Windows: `MdExplorer-Setup.exe`
- macOS: `MdExplorer.dmg`
- Linux: `MdExplorer.AppImage`

## Development

```bash
npm install
npm start          # start in development mode
npm run make       # build installable package
```

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+O` | Open folder |
| `Ctrl+W` | Close active tab |
| `Ctrl+Tab` | Next tab |
| `Ctrl+Shift+Tab` | Previous tab |
| `↑` / `k` | Scroll / navigate up |
| `↓` / `j` | Scroll / navigate down |
| `PgUp` / `PgDn` | Page scroll |
| `Home` / `End` | Document start / end |
| `Enter` | Open file / toggle folder |
| `?` | Show keyboard shortcuts |
| `Ctrl+Q` | Quit |

## CLI Usage

```bash
# Open a specific folder at launch
mdexplorer /path/to/docs
```

## Session State Location

| Platform | Path |
|---|---|
| Windows | `%APPDATA%\mdexplorer\config.json` |
| macOS | `~/Library/Application Support/mdexplorer/config.json` |
| Linux | `~/.config/mdexplorer/config.json` |

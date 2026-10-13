<div align="center">

<img src="assets/icon.png" alt="MdExplorer" width="96" height="96" />

# MdExplorer

**一款快速、类 VS Code 风格的 Markdown 文件夹桌面浏览器。**
秒开超大文档目录，搜索时界面不卡顿，用你喜欢的主题舒适阅读。

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Electron](https://img.shields.io/badge/Electron-43-47848F?logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)

[English](README.md) · **简体中文**

</div>

---

## ✨ 功能特性

| | |
|---|---|
| ⚡ **秒开 + 懒加载目录树** | 每次只读取你展开的那一层目录，超大文件夹也不会卡住界面。 |
| 🔎 **后台搜索** | 按文件名搜索 Markdown 文件，也可同时搜索文件内容。结果实时流式出现，可随时停止，搜索期间可继续工作。 |
| 🗂️ **类 VS Code 侧边栏** | 左侧活动栏包含资源管理器、搜索和设置；再次点击当前图标即可收起侧边栏。 |
| 📑 **多标签阅读** | 同时打开多个文档，支持标签右键菜单和快速标签切换（`Ctrl+Shift+E`）。 |
| 🔗 **智能链接** | 文档中指向其他 `.md` 文件的链接会在新标签页打开（同一文件不会重复打开），且不会改动目录树；外部链接用浏览器打开。 |
| 🎨 **两类主题** | 界面主题：Nocturne、Light、Graphite、High contrast；文档主题：Nocturne、GitHub、Nord、Dracula、Plain。 |
| 🧠 **记住你的会话** | 记住上次的文件夹、打开的标签、当前标签、滚动位置、窗口大小和主题；重新打开上次文件夹前会先询问你。 |
| 🖥️ **多显示器安全** | 如果窗口上次位于已断开的显示器，下次会自动回到主显示器。 |
| 📝 **丰富的 Markdown 渲染** | 代码高亮、表格、引用块、GitHub 风格 Markdown、YAML Front Matter 表格；内嵌脚本会被移除。 |

## 🚀 快速开始

### 安装

为你的平台构建安装包（见[开发](#-开发)）：

| 平台 | `npm run make` 的输出 |
|---|---|
| Windows | `out/make/squirrel.windows/x64/MdExplorer-<版本> Setup.exe` |
| macOS | `out/make/zip/darwin/…`（ZIP） |
| Linux | `out/make/deb/…` 和 `out/make/rpm/…` |

### 打开文件夹

- 使用 **文件 → Open Folder…**（`Ctrl+O`）或工具栏的 **Open Folder** 按钮；或者
- 启动时传入文件夹参数：

```bash
mdexplorer /path/to/docs
```

## ⌨️ 快捷键

| 快捷键 | 功能 |
|---|---|
| `Ctrl+O` | 打开文件夹 |
| `Ctrl+,` | 设置 |
| `Ctrl+Shift+F` | 搜索文件 |
| `Ctrl+Shift+E` | 标签切换器 |
| `Ctrl+Tab` / `Ctrl+Shift+Tab` | 下一个 / 上一个标签 |
| `Ctrl+W` | 关闭当前标签 |
| `F5` | 刷新目录树 |
| `↑` `↓` / `k` `j` | 在目录树中移动，或滚动文档 |
| `←` `→` | 折叠 / 展开所选文件夹 |
| `PgUp` `PgDn` · `Home` `End` | 翻页 · 跳到文档开头 / 结尾 |
| `Enter` | 打开文件 / 展开或折叠文件夹 |
| `?` | 显示快捷键列表 |
| `Ctrl+Q` | 退出 |

## 🛠️ 开发

环境要求：较新的 Node.js（开发环境为 v24）与 npm。

```bash
npm install
npm start          # 开发模式运行
npm test           # 单元测试（Vitest）
npm run make       # 构建安装包，输出到 out/make
```

**技术栈：** Electron + [Electron Forge](https://www.electronforge.io/)（Vite 插件）、React 19、TypeScript、`marked`、`highlight.js`、`electron-store`。

```
src/
├── main/       # Electron 主进程：目录列举、搜索、链接解析、状态存储
├── preload/    # 暴露给渲染进程的安全 IPC 桥
└── renderer/   # React 界面：侧边栏、目录树、搜索、标签页、阅读器、主题
openspec/       # 规格与变更历史（OpenSpec）
```

> **依赖说明：** 有意固定了 `electron-store@8` 和 `@vitejs/plugin-react@4`——更高的大版本仅支持 ESM，会破坏 Vite 的 CommonJS 主进程构建。

## 💾 设置存储位置

| 平台 | 路径 |
|---|---|
| Windows | `%APPDATA%\mdexplorer\config.json` |
| macOS | `~/Library/Application Support/mdexplorer/config.json` |
| Linux | `~/.config/mdexplorer/config.json` |

## 🤝 参与贡献

欢迎提交 Issue 和 Pull Request。请从 `main` 分支创建分支，保持改动聚焦，并向 `main` 提交 PR。行为层面的变更以 OpenSpec 变更的形式记录在 [`openspec/`](openspec/) 下。

## 📄 许可证

[MIT](LICENSE) © 2026 czhou-perosnal-share

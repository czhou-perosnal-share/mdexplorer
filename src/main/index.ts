import { app, BrowserWindow, ipcMain, dialog, shell, Menu, screen } from 'electron';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import path from 'node:path';
import fs from 'node:fs';
import started from 'electron-squirrel-startup';
import { getState, setState, type AppState } from './store';

if (started) {
  app.quit();
}

export interface FileNode {
  type: 'file';
  name: string;
  absolutePath: string;
  relativePath: string;
}

export interface DirNode {
  type: 'dir';
  name: string;
  absolutePath: string;
  relativePath: string;
}

export type TreeNode = FileNode | DirNode;

export type TreeMode = 'md-only' | 'full';

export type LinkTarget =
  | { kind: 'md'; absolutePath: string; relativePath: string }
  | { kind: 'file'; absolutePath: string }
  | { kind: 'external' }
  | { kind: 'missing'; target: string }
  | { kind: 'ignore' };

export interface SearchRequest {
  id: number;
  root: string;
  query: string;
  contents: boolean;
}

export interface SearchHit {
  name: string;
  absolutePath: string;
  relativePath: string;
  // First matching line when searching file contents
  line?: string;
  lineNo?: number;
}

export interface SearchDone {
  id: number;
  scanned: number;
  truncated: boolean;
  cancelled: boolean;
}

const IGNORED_DIRS_MD_ONLY = new Set(['.git', 'node_modules']);
const MAX_SEARCH_HITS = 2000;
const MAX_CONTENT_BYTES = 2 * 1024 * 1024;

function isListed(name: string, isDir: boolean, mode: TreeMode): boolean {
  if (mode === 'full') return true;
  return isDir ? !IGNORED_DIRS_MD_ONLY.has(name) : name.endsWith('.md');
}

// Lists a single directory level (folders first). Children are loaded lazily by the renderer.
async function listDir(dirPath: string, rootPath: string, mode: TreeMode): Promise<TreeNode[]> {
  let entries: fs.Dirent[];
  try {
    entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
  } catch {
    return [];
  }

  const dirs: DirNode[] = [];
  const files: FileNode[] = [];
  for (const entry of entries) {
    const isDir = entry.isDirectory();
    if (!isDir && !entry.isFile()) continue;
    if (!isListed(entry.name, isDir, mode)) continue;
    const absolutePath = path.join(dirPath, entry.name);
    const relativePath = path.relative(rootPath, absolutePath).replace(/\\/g, '/');
    if (isDir) dirs.push({ type: 'dir', name: entry.name, absolutePath, relativePath });
    else files.push({ type: 'file', name: entry.name, absolutePath, relativePath });
  }
  const byName = (a: TreeNode, b: TreeNode) => a.name.localeCompare(b.name);
  return [...dirs.sort(byName), ...files.sort(byName)];
}

interface SearchJob {
  cancelled: boolean;
}

const searchJobs = new Map<number, SearchJob>();

// Walks the folder asynchronously, streaming batches of hits to the renderer.
async function runSearch(sender: Electron.WebContents, req: SearchRequest, job: SearchJob) {
  const needle = req.query.toLowerCase();
  const queue: string[] = [req.root];
  let scanned = 0;
  let total = 0;
  let truncated = false;
  let batch: SearchHit[] = [];
  let lastFlush = Date.now();

  const flush = () => {
    if (batch.length > 0 && !sender.isDestroyed()) sender.send('search-hits', req.id, batch);
    batch = [];
    lastFlush = Date.now();
  };

  while (queue.length > 0 && !job.cancelled && !truncated) {
    const dir = queue.pop()!;
    let entries: fs.Dirent[];
    try {
      entries = await fs.promises.readdir(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    entries.sort((a, b) => b.name.localeCompare(a.name)); // popped from the end => ascending order
    for (const entry of entries) {
      if (job.cancelled) break;
      const isDir = entry.isDirectory();
      if (!isDir && !entry.isFile()) continue;
      // Search only ever covers Markdown files, regardless of the tree's display mode
      if (!isListed(entry.name, isDir, 'md-only')) continue;
      const absolutePath = path.join(dir, entry.name);
      if (isDir) { queue.push(absolutePath); continue; }

      scanned++;
      const hit: SearchHit = {
        name: entry.name,
        absolutePath,
        relativePath: path.relative(req.root, absolutePath).replace(/\\/g, '/'),
      };
      let matched = entry.name.toLowerCase().includes(needle);
      if (!matched && req.contents) {
        try {
          const stat = await fs.promises.stat(absolutePath);
          if (stat.size <= MAX_CONTENT_BYTES) {
            const text = await fs.promises.readFile(absolutePath, 'utf-8');
            const idx = text.toLowerCase().indexOf(needle);
            if (idx !== -1) {
              matched = true;
              const start = text.lastIndexOf('\n', idx) + 1;
              const end = text.indexOf('\n', idx);
              hit.line = text.slice(start, end === -1 ? undefined : end).trim().slice(0, 200);
              hit.lineNo = text.slice(0, idx).split('\n').length;
            }
          }
        } catch { /* unreadable: skip */ }
      }
      if (matched) {
        batch.push(hit);
        if (++total >= MAX_SEARCH_HITS) { truncated = true; break; }
      }
      if (batch.length >= 50 || Date.now() - lastFlush >= 100) flush();
    }
  }

  flush();
  searchJobs.delete(req.id);
  if (!sender.isDestroyed()) {
    const done: SearchDone = { id: req.id, scanned, truncated, cancelled: job.cancelled };
    sender.send('search-done', done);
  }
}

async function readFile(filePath: string): Promise<{ content: string; lineCount: number }> {
  const raw = await fs.promises.readFile(filePath, 'utf-8');
  const lineCount = raw.split('\n').length;
  return { content: raw, lineCount };
}

let mainWindow: BrowserWindow | null = null;

function buildMenu(win: BrowserWindow) {
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Folder...',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(win, { properties: ['openDirectory'] });
            if (!result.canceled && result.filePaths.length > 0) {
              win.webContents.send('open-folder-from-menu', result.filePaths[0]);
            }
          },
        },
        { label: 'Settings...', accelerator: 'CmdOrCtrl+,', click: () => win.webContents.send('open-settings') },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => win.webContents.reload() },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Keyboard Shortcuts',
          click: () => win.webContents.send('show-shortcuts'),
        },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);
}

// Saved bounds are only usable if the window would still be reachable on a connected display.
function isVisibleOnSomeDisplay(b: { x: number; y: number; width: number; height: number }): boolean {
  return screen.getAllDisplays().some(({ workArea: w }) => {
    const overlapX = Math.min(b.x + b.width, w.x + w.width) - Math.max(b.x, w.x);
    const overlapY = Math.min(b.y + b.height, w.y + w.height) - Math.max(b.y, w.y);
    return overlapX >= 100 && overlapY >= 50;
  });
}

function createWindow() {
  const state = getState();
  const saved = state.windowBounds;
  const usePosition = !!saved && saved.x != null && saved.y != null && isVisibleOnSomeDisplay(saved);

  mainWindow = new BrowserWindow({
    width: saved?.width ?? 1200,
    height: saved?.height ?? 800,
    // Omitting x/y lets Electron center the window on the primary display.
    x: usePosition ? saved.x : undefined,
    y: usePosition ? saved.y : undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  buildMenu(mainWindow);

  // Links in documents are handled by the renderer; never let them navigate the app window.
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (e) => e.preventDefault());

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  const saveBounds = () => {
    if (mainWindow && !mainWindow.isMinimized() && !mainWindow.isMaximized() && !mainWindow.isFullScreen()) {
      const bounds = mainWindow.getBounds();
      setState({ windowBounds: bounds });
    }
  };
  mainWindow.on('resize', saveBounds);
  mainWindow.on('move', saveBounds);

  mainWindow.on('ready-to-show', () => {
    const cliFolder = getCLIFolder();
    if (cliFolder && mainWindow) {
      mainWindow.webContents.send('folder-from-cli', cliFolder);
    }
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

function getCLIFolder(): string | null {
  const args = process.argv.slice(app.isPackaged ? 1 : 2);
  for (const arg of args) {
    if (!arg.startsWith('-') && fs.existsSync(arg)) {
      try {
        if (fs.statSync(arg).isDirectory()) return arg;
      } catch { /* ignore */ }
    }
  }
  return null;
}

ipcMain.handle('list-dir', (_event, dirPath: string, rootPath: string, mode: TreeMode = 'md-only') => {
  return listDir(dirPath, rootPath, mode);
});

ipcMain.handle('search-start', (event, req: SearchRequest) => {
  for (const job of searchJobs.values()) job.cancelled = true;
  const job: SearchJob = { cancelled: false };
  searchJobs.set(req.id, job);
  void runSearch(event.sender, req, job);
});

ipcMain.handle('search-cancel', () => {
  for (const job of searchJobs.values()) job.cancelled = true;
});

const realpathNative = promisify(fs.realpath.native);
const EXTERNAL_RE = /^(https?:|mailto:)/i;
const OTHER_SCHEME_RE = /^[a-z][a-z0-9+.-]*:/i;

// Resolves a link clicked inside a document. Targets are never added to the folder tree.
ipcMain.handle('resolve-link', async (_event, currentFile: string, href: string, root: string): Promise<LinkTarget> => {
  const raw = href.trim();
  if (EXTERNAL_RE.test(raw)) return { kind: 'external' };

  let target: string;
  try {
    if (/^file:/i.test(raw)) {
      target = fileURLToPath(raw.split('#')[0]);
    } else if (OTHER_SCHEME_RE.test(raw) && !path.win32.isAbsolute(raw)) {
      return { kind: 'ignore' };
    } else {
      let p = raw.split('#')[0].split('?')[0];
      try { p = decodeURIComponent(p); } catch { /* keep as is */ }
      if (!p) return { kind: 'ignore' };
      if (/^[\\/]/.test(p)) target = path.join(root, p); // "/docs/a.md" is relative to the opened folder
      else if (path.isAbsolute(p)) target = p;
      else target = path.resolve(path.dirname(currentFile), p);
    }
  } catch {
    return { kind: 'ignore' };
  }

  const candidates = path.extname(target) ? [target] : [target, `${target}.md`];
  for (const candidate of candidates) {
    try {
      // realpath gives the canonical casing, so the same file always maps to the same tab
      const real = await realpathNative(candidate);
      if (!(await fs.promises.stat(real)).isFile()) continue;
      if (!/\.md$/i.test(real)) return { kind: 'file', absolutePath: real };
      const rel = path.relative(root, real);
      const inside = rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
      return { kind: 'md', absolutePath: real, relativePath: inside ? rel.replace(/\\/g, '/') : real };
    } catch { /* try next candidate */ }
  }
  return { kind: 'missing', target };
});

ipcMain.handle('open-external', (_event, url: string) => {
  if (EXTERNAL_RE.test(url)) return shell.openExternal(url);
});

ipcMain.handle('open-path', async (_event, filePath: string) => {
  const err = await shell.openPath(filePath);
  return err; // empty string on success, error message on failure
});

ipcMain.handle('read-file', (_event, filePath: string) => {
  return readFile(filePath);
});

ipcMain.handle('open-folder-dialog', async () => {
  const win = mainWindow;
  if (!win) return null;
  const result = await dialog.showOpenDialog(win, { properties: ['openDirectory'] });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('get-state', () => getState());

ipcMain.handle('set-state', (_event, partial: Partial<AppState>) => {
  setState(partial);
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

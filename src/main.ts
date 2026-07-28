import { app, BrowserWindow, ipcMain, dialog, shell, Menu } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import started from 'electron-squirrel-startup';
import { getState, setState, type AppState } from './main/store';

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
  children: TreeNode[];
}

export type TreeNode = FileNode | DirNode;

function scanFolder(dirPath: string, rootPath: string, mode: 'md-only' | 'full' = 'md-only'): TreeNode[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return [];
  }

  const result: TreeNode[] = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      const children = scanFolder(fullPath, rootPath, mode);
      if (mode === 'full' || children.length > 0) {
        result.push({ type: 'dir', name: entry.name, children });
      }
    } else if (entry.isFile()) {
      if (mode === 'full' || entry.name.endsWith('.md')) {
        result.push({
          type: 'file',
          name: entry.name,
          absolutePath: fullPath,
          relativePath: path.relative(rootPath, fullPath).replace(/\\/g, '/'),
        });
      }
    }
  }
  return result;
}

function readFile(filePath: string): { content: string; lineCount: number } {
  const raw = fs.readFileSync(filePath, 'utf-8');
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

function createWindow() {
  const state = getState();
  const { windowBounds } = state;

  mainWindow = new BrowserWindow({
    width: windowBounds?.width ?? 1200,
    height: windowBounds?.height ?? 800,
    x: windowBounds?.x,
    y: windowBounds?.y,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  buildMenu(mainWindow);

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  const saveBounds = () => {
    if (mainWindow) {
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

ipcMain.handle('scan-folder', (_event, folderPath: string, mode: 'md-only' | 'full' = 'md-only') => {
  return scanFolder(folderPath, folderPath, mode);
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

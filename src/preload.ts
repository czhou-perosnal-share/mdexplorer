import { contextBridge, ipcRenderer } from 'electron';
import type { TreeNode } from './main';
import type { AppState } from './main/store';

export interface ReadFileResult {
  content: string;
  lineCount: number;
}

export interface ElectronAPI {
  scanFolder: (folderPath: string, mode?: 'md-only' | 'full') => Promise<TreeNode[]>;
  readFile: (filePath: string) => Promise<ReadFileResult>;
  openFolderDialog: () => Promise<string | null>;
  openPath: (filePath: string) => Promise<string>;
  getState: () => Promise<AppState>;
  setState: (partial: Partial<AppState>) => Promise<void>;
  onFolderFromCLI: (cb: (folder: string) => void) => () => void;
  onOpenFolderFromMenu: (cb: (folder: string) => void) => () => void;
  onShowShortcuts: (cb: () => void) => () => void;
}

const api: ElectronAPI = {
  scanFolder: (folderPath, mode = 'md-only') => ipcRenderer.invoke('scan-folder', folderPath, mode),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
  openPath: (filePath) => ipcRenderer.invoke('open-path', filePath),
  getState: () => ipcRenderer.invoke('get-state'),
  setState: (partial) => ipcRenderer.invoke('set-state', partial),

  onFolderFromCLI: (cb) => {
    const handler = (_: Electron.IpcRendererEvent, folder: string) => cb(folder);
    ipcRenderer.on('folder-from-cli', handler);
    return () => ipcRenderer.off('folder-from-cli', handler);
  },

  onOpenFolderFromMenu: (cb) => {
    const handler = (_: Electron.IpcRendererEvent, folder: string) => cb(folder);
    ipcRenderer.on('open-folder-from-menu', handler);
    return () => ipcRenderer.off('open-folder-from-menu', handler);
  },

  onShowShortcuts: (cb) => {
    const handler = () => cb();
    ipcRenderer.on('show-shortcuts', handler);
    return () => ipcRenderer.off('show-shortcuts', handler);
  },
};

contextBridge.exposeInMainWorld('api', api);

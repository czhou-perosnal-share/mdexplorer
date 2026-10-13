import { contextBridge, ipcRenderer } from 'electron';
import type { TreeNode, TreeMode, LinkTarget, SearchRequest, SearchHit, SearchDone } from '../main';
import type { AppState } from '../main/store';

export interface ReadFileResult {
  content: string;
  lineCount: number;
}

export interface ElectronAPI {
  listDir: (dirPath: string, rootPath: string, mode: TreeMode) => Promise<TreeNode[]>;
  searchStart: (req: SearchRequest) => Promise<void>;
  searchCancel: () => Promise<void>;
  onSearchHits: (cb: (id: number, hits: SearchHit[]) => void) => () => void;
  onSearchDone: (cb: (done: SearchDone) => void) => () => void;
  readFile: (filePath: string) => Promise<ReadFileResult>;
  openFolderDialog: () => Promise<string | null>;
  openPath: (filePath: string) => Promise<string>;
  openExternal: (url: string) => Promise<void>;
  resolveLink: (currentFile: string, href: string, root: string) => Promise<LinkTarget>;
  getState: () => Promise<AppState>;
  setState: (partial: Partial<AppState>) => Promise<void>;
  onFolderFromCLI: (cb: (folder: string) => void) => () => void;
  onOpenFolderFromMenu: (cb: (folder: string) => void) => () => void;
  onShowShortcuts: (cb: () => void) => () => void;
  onOpenSettings: (cb: () => void) => () => void;
}

const api: ElectronAPI = {
  listDir: (dirPath, rootPath, mode) => ipcRenderer.invoke('list-dir', dirPath, rootPath, mode),
  searchStart: (req) => ipcRenderer.invoke('search-start', req),
  searchCancel: () => ipcRenderer.invoke('search-cancel'),
  onSearchHits: (cb) => {
    const handler = (_: Electron.IpcRendererEvent, id: number, hits: SearchHit[]) => cb(id, hits);
    ipcRenderer.on('search-hits', handler);
    return () => ipcRenderer.off('search-hits', handler);
  },
  onSearchDone: (cb) => {
    const handler = (_: Electron.IpcRendererEvent, done: SearchDone) => cb(done);
    ipcRenderer.on('search-done', handler);
    return () => ipcRenderer.off('search-done', handler);
  },
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
  openPath: (filePath) => ipcRenderer.invoke('open-path', filePath),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  resolveLink: (currentFile, href, root) => ipcRenderer.invoke('resolve-link', currentFile, href, root),
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

  onOpenSettings: (cb) => {
    const handler = () => cb();
    ipcRenderer.on('open-settings', handler);
    return () => ipcRenderer.off('open-settings', handler);
  },

  onShowShortcuts: (cb) => {
    const handler = () => cb();
    ipcRenderer.on('show-shortcuts', handler);
    return () => ipcRenderer.off('show-shortcuts', handler);
  },
};

contextBridge.exposeInMainWorld('api', api);

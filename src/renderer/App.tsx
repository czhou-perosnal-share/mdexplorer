import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { FolderTree } from './components/FolderTree';
import { TabBar, type Tab } from './components/TabBar';
import { MarkdownViewer, EmptyViewer } from './components/MarkdownViewer';
import { TabSwitcher } from './components/TabSwitcher';
import type { TreeNode } from '../main';
import type { AppState, ContentTheme } from '../main/store';
import githubCss from './themes/github.css?inline';
import nordCss from './themes/nord.css?inline';
import draculaCss from './themes/dracula.css?inline';
import plainCss from './themes/plain.css?inline';
import nocturneCss from './themes/nocturne.css?inline';

const CONTENT_THEMES: ContentTheme[] = ['nocturne', 'github', 'nord', 'dracula', 'plain'];
const THEME_CSS: Record<ContentTheme, string> = {
  nocturne: nocturneCss,
  github: githubCss,
  nord: nordCss,
  dracula: draculaCss,
  plain: plainCss,
};

function applyContentTheme(name: ContentTheme) {
  let style = document.getElementById('theme-style') as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = 'theme-style';
    document.head.appendChild(style);
  }
  style.textContent = THEME_CSS[name] ?? THEME_CSS['nocturne'];
}

function basename(p: string): string {
  return p.split('/').pop() || p.split('\\').pop() || p;
}

function folderBasename(p: string): string {
  return p.replace(/[/\\]+$/, '').split(/[/\\]/).pop() || p;
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      width="13" height="13" viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      className={spinning ? 'tree-refresh-btn__icon--spinning' : undefined}
    >
      <path d="M13.5 8a5.5 5.5 0 1 1-1.1-3.3" />
      <polyline points="13.5 2 13.5 5.5 10 5.5" />
    </svg>
  );
}

interface FileData {
  content: string;
  lineCount: number;
}

export function App() {
  const [rootFolder, setRootFolder] = useState<string>('');
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [fileCache, setFileCache] = useState<Record<string, FileData>>({});
  const [scrollPositions, setScrollPositions] = useState<Record<string, number>>({});
  const [contentTheme, setContentTheme] = useState<ContentTheme>('nocturne');
  const [treeMode, setTreeMode] = useState<'md-only' | 'full'>('md-only');
  const [filterQuery, setFilterQuery] = useState('');
  const [openPathError, setOpenPathError] = useState<string>('');
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isTreeLoading, setIsTreeLoading] = useState(false);
  const initialized = useRef(false);

  const persistState = useCallback((patch: Partial<AppState>) => {
    window.api.setState(patch);
  }, []);

  const loadFolder = useCallback(async (folderPath: string, mode?: 'md-only' | 'full') => {
    const effectiveMode = mode ?? treeMode;
    const scanned = await window.api.scanFolder(folderPath, effectiveMode);
    setRootFolder(folderPath);
    setTree(scanned);
    persistState({ lastFolder: folderPath });
  }, [persistState, treeMode]);

  const loadFile = useCallback(async (absolutePath: string): Promise<FileData | null> => {
    if (fileCache[absolutePath]) return fileCache[absolutePath];
    try {
      const result = await window.api.readFile(absolutePath);
      const data: FileData = { content: result.content, lineCount: result.lineCount };
      setFileCache(prev => ({ ...prev, [absolutePath]: data }));
      return data;
    } catch {
      return null;
    }
  }, [fileCache]);

  const openTab = useCallback(async (absolutePath: string, relativePath: string) => {
    const existing = tabs.find(t => t.absolutePath === absolutePath);
    if (existing) {
      setActiveTab(absolutePath);
      persistState({ activeTab: absolutePath });
      return;
    }
    const name = basename(relativePath);
    const newTab: Tab = { absolutePath, relativePath, name };
    const newTabs = [...tabs, newTab];
    setTabs(newTabs);
    setActiveTab(absolutePath);
    await loadFile(absolutePath);
    persistState({
      openTabs: newTabs.map(t => t.absolutePath),
      activeTab: absolutePath,
    });
  }, [tabs, loadFile, persistState]);

  const closeTab = useCallback((absolutePath: string) => {
    setTabs(prev => {
      const idx = prev.findIndex(t => t.absolutePath === absolutePath);
      if (idx === -1) return prev;
      const next = prev.filter(t => t.absolutePath !== absolutePath);
      setActiveTab(cur => {
        if (cur !== absolutePath) return cur;
        if (next.length === 0) return null;
        const newIdx = Math.min(idx, next.length - 1);
        const newActive = next[newIdx].absolutePath;
        persistState({ activeTab: newActive });
        return newActive;
      });
      persistState({ openTabs: next.map(t => t.absolutePath) });
      return next;
    });
  }, [persistState]);

  const closeOthers = useCallback((absolutePath: string) => {
    setTabs(prev => {
      const next = prev.filter(t => t.absolutePath === absolutePath);
      setActiveTab(absolutePath);
      persistState({ openTabs: next.map(t => t.absolutePath), activeTab: absolutePath });
      return next;
    });
  }, [persistState]);

  const closeToTheRight = useCallback((absolutePath: string) => {
    setTabs(prev => {
      const idx = prev.findIndex(t => t.absolutePath === absolutePath);
      if (idx === -1) return prev;
      const next = prev.slice(0, idx + 1);
      setActiveTab(cur => {
        const stillOpen = next.some(t => t.absolutePath === cur);
        const newActive = stillOpen ? cur : absolutePath;
        persistState({ openTabs: next.map(t => t.absolutePath), activeTab: newActive });
        return newActive;
      });
      return next;
    });
  }, [persistState]);

  const closeAll = useCallback(() => {
    setTabs([]);
    setActiveTab(null);
    persistState({ openTabs: [], activeTab: '' });
  }, [persistState]);

  const handleScrollChange = useCallback((absolutePath: string, px: number) => {
    setScrollPositions(prev => {
      const next = { ...prev, [absolutePath]: px };
      persistState({ scrollPositions: next });
      return next;
    });
  }, [persistState]);

  const handleContentThemeChange = useCallback((name: ContentTheme) => {
    setContentTheme(name);
    applyContentTheme(name);
    persistState({ contentTheme: name });
  }, [persistState]);

  const handleTreeModeToggle = useCallback(async () => {
    const next: 'md-only' | 'full' = treeMode === 'md-only' ? 'full' : 'md-only';
    setTreeMode(next);
    persistState({ treeMode: next });
    if (rootFolder) {
      setIsTreeLoading(true);
      const scanned = await window.api.scanFolder(rootFolder, next);
      setTree(scanned);
      setIsTreeLoading(false);
    }
  }, [treeMode, rootFolder, persistState]);

  const handleOpenFolder = useCallback(async () => {
    const folder = await window.api.openFolderDialog();
    if (folder) {
      setTabs([]);
      setActiveTab(null);
      setFileCache({});
      setFilterQuery('');
      await loadFolder(folder);
    }
  }, [loadFolder]);

  const handleRefresh = useCallback(async () => {
    if (!rootFolder || isTreeLoading) return;
    setIsTreeLoading(true);
    await loadFolder(rootFolder, treeMode);
    setIsTreeLoading(false);
  }, [rootFolder, treeMode, isTreeLoading, loadFolder]);

  useEffect(() => {
    const handleF5 = (e: KeyboardEvent) => {
      if (e.key === 'F5') { e.preventDefault(); handleRefresh(); }
    };
    window.addEventListener('keydown', handleF5);
    return () => window.removeEventListener('keydown', handleF5);
  }, [handleRefresh]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    (async () => {
      const state = await window.api.getState();

      // Migrate: old `theme` key → contentTheme, defaulting to nocturne
      const saved = (state as any).contentTheme || (state as any).theme;
      const initTheme: ContentTheme = CONTENT_THEMES.includes(saved as ContentTheme)
        ? (saved as ContentTheme)
        : 'nocturne';
      setContentTheme(initTheme);
      applyContentTheme(initTheme);

      const initMode = state.treeMode || 'md-only';
      setTreeMode(initMode);

      if (state.scrollPositions) setScrollPositions(state.scrollPositions);

      if (state.lastFolder) {
        await loadFolder(state.lastFolder, initMode);

        if (state.openTabs && state.openTabs.length > 0) {
          const restoredTabs: Tab[] = [];
          for (const absPath of state.openTabs) {
            try {
              const data = await window.api.readFile(absPath);
              const rel = state.lastFolder
                ? absPath.replace(state.lastFolder, '').replace(/^[/\\]/, '').replace(/\\/g, '/')
                : absPath;
              const name = basename(rel);
              restoredTabs.push({ absolutePath: absPath, relativePath: rel, name });
              setFileCache(prev => ({ ...prev, [absPath]: { content: data.content, lineCount: data.lineCount } }));
            } catch { /* file gone, skip */ }
          }
          setTabs(restoredTabs);
          const activeExists = restoredTabs.find(t => t.absolutePath === state.activeTab);
          const newActive = activeExists ? state.activeTab : (restoredTabs[0]?.absolutePath ?? null);
          setActiveTab(newActive);
        }
      }
    })();

    const handleSwitcherKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        setShowSwitcher(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleSwitcherKey);

    const offCli = window.api.onFolderFromCLI(loadFolder);
    const offMenu = window.api.onOpenFolderFromMenu(async (folder) => {
      setTabs([]);
      setActiveTab(null);
      setFileCache({});
      setFilterQuery('');
      await loadFolder(folder);
    });
    const offShortcuts = window.api.onShowShortcuts(() => setShowShortcuts(s => !s));

    return () => {
      window.removeEventListener('keydown', handleSwitcherKey);
      offCli(); offMenu(); offShortcuts();
    };
  }, []);

  const activeFileData = activeTab ? fileCache[activeTab] : undefined;
  const activeTabObj = tabs.find(t => t.absolutePath === activeTab);

  /* Breadcrumb: rootFolderName / activeFileName (basename only) */
  const breadcrumb = (() => {
    if (!rootFolder) return 'No folder open';
    const parts = [folderBasename(rootFolder)];
    if (activeTabObj) parts.push(basename(activeTabObj.relativePath));
    return parts.join(' / ');
  })();

  return (
    <div className="app">
      <div className="toolbar">
        <span className="toolbar__brand">MdExplorer</span>
        <button className="toolbar__btn" onClick={handleOpenFolder}>Open Folder</button>
        <span className="toolbar__breadcrumb" title={activeTabObj?.relativePath ?? rootFolder}>
          {breadcrumb}
        </span>
        <select
          className="toolbar__content-theme"
          value={contentTheme}
          onChange={e => handleContentThemeChange(e.target.value as ContentTheme)}
          title="Viewer theme — affects the document only"
        >
          {CONTENT_THEMES.map(t => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
        <button
          className="toolbar__btn toolbar__switcher-btn"
          onClick={() => setShowSwitcher(true)}
          disabled={tabs.length === 0}
          title="Open tab switcher (Ctrl+Shift+E)"
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1 3h14v2H1V3zm0 4h10v2H1V7zm0 4h14v2H1v-2z"/>
          </svg>
        </button>
      </div>

      <div className="panels-container">
        <PanelGroup orientation="horizontal">
          <Panel defaultSize={30} minSize={15} className="panel panel--tree">
            {isTreeLoading && <div className="tree-panel-overlay" />}
            <div className="tree-filter-row">
              <input
                className="tree-filter"
                type="text"
                placeholder="Filter files…"
                value={filterQuery}
                onChange={e => setFilterQuery(e.target.value)}
              />
            </div>
            <div className="tree-files-header">
              <span className="tree-files-label">Files</span>
              <div className="tree-files-actions">
                <button
                  className="tree-refresh-btn"
                  onClick={handleRefresh}
                  disabled={!rootFolder || isTreeLoading}
                  title="Refresh folder (F5)"
                >
                  <RefreshIcon spinning={isTreeLoading} />
                </button>
                <button
                  className="tree-mode-toggle"
                  onClick={handleTreeModeToggle}
                  title={treeMode === 'md-only' ? 'MD Only — click to show all files' : 'All Files — click to show MD only'}
                >
                  {treeMode === 'md-only' ? 'MD only' : 'All files'}
                </button>
              </div>
            </div>
            <FolderTree
              tree={tree}
              mode={treeMode}
              filterQuery={filterQuery}
              onFileSelect={(abs, rel) => openTab(abs, rel)}
              onOpenError={(msg) => setOpenPathError(msg)}
            />
          </Panel>
          <PanelResizeHandle className="resize-handle" />
          <Panel defaultSize={70} className="panel panel--viewer">
            <TabBar
              tabs={tabs}
              activeTab={activeTab}
              onTabSelect={setActiveTab}
              onTabClose={closeTab}
              onCloseOthers={closeOthers}
              onCloseToRight={closeToTheRight}
              onCloseAll={closeAll}
            />
            {activeFileData && activeTab ? (
              <MarkdownViewer
                key={activeTab}
                content={activeFileData.content}
                lineCount={activeFileData.lineCount}
                relativePath={activeTabObj?.relativePath ?? ''}
                initialScroll={scrollPositions[activeTab]}
                onScrollChange={(px) => handleScrollChange(activeTab, px)}
              />
            ) : (
              <EmptyViewer />
            )}
          </Panel>
        </PanelGroup>
      </div>

      <div className="statusbar">
        {openPathError ? (
          <span className="statusbar__error" onClick={() => setOpenPathError('')}>⚠ {openPathError}</span>
        ) : activeTabObj ? (
          <>
            <span className="statusbar__path">{activeTabObj.relativePath}</span>
            <span className="statusbar__lines">
              {activeFileData ? `${activeFileData.lineCount.toLocaleString()} lines` : ''}
            </span>
          </>
        ) : (
          <span className="statusbar__hint">Press ? for keyboard shortcuts</span>
        )}
      </div>

      {showSwitcher && tabs.length > 0 && (
        <TabSwitcher
          tabs={tabs}
          onActivate={(path) => { setActiveTab(path); }}
          onClose={() => setShowSwitcher(false)}
        />
      )}

      {showShortcuts && (
        <div className="shortcuts-overlay" onClick={() => setShowShortcuts(false)}>
          <div className="shortcuts-modal" onClick={e => e.stopPropagation()}>
            <h2>Keyboard Shortcuts</h2>
            <table>
              <tbody>
                <tr><td><kbd>Ctrl+O</kbd></td><td>Open folder</td></tr>
                <tr><td><kbd>Ctrl+W</kbd></td><td>Close active tab</td></tr>
                <tr><td><kbd>Ctrl+Tab</kbd></td><td>Next tab</td></tr>
                <tr><td><kbd>Ctrl+Shift+Tab</kbd></td><td>Previous tab</td></tr>
                <tr><td><kbd>Ctrl+Shift+E</kbd></td><td>Open tab switcher</td></tr>
                <tr><td><kbd>↑ / k</kbd></td><td>Scroll / navigate up</td></tr>
                <tr><td><kbd>↓ / j</kbd></td><td>Scroll / navigate down</td></tr>
                <tr><td><kbd>PgUp / PgDn</kbd></td><td>Page scroll</td></tr>
                <tr><td><kbd>Home / End</kbd></td><td>Document start / end</td></tr>
                <tr><td><kbd>Enter</kbd></td><td>Open file / toggle folder</td></tr>
                <tr><td><kbd>?</kbd></td><td>Toggle this help</td></tr>
                <tr><td><kbd>Ctrl+Q</kbd></td><td>Quit</td></tr>
              </tbody>
            </table>
            <button onClick={() => setShowShortcuts(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle, usePanelRef } from 'react-resizable-panels';
import { FolderTree } from './components/FolderTree';
import { TabBar, type Tab } from './components/TabBar';
import { MarkdownViewer, EmptyViewer } from './components/MarkdownViewer';
import { TabSwitcher } from './components/TabSwitcher';
import { SearchPanel } from './components/SearchPanel';
import type { AppState, ContentTheme, UiTheme } from '../main/store';
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

const UI_THEMES: { id: UiTheme; label: string; swatch: [string, string, string] }[] = [
  { id: 'nocturne', label: 'Nocturne', swatch: ['#161826', '#2a2d3e', '#9184d9'] },
  { id: 'light', label: 'Light', swatch: ['#f6f7fb', '#d9dce8', '#5b4bc4'] },
  { id: 'graphite', label: 'Graphite', swatch: ['#1c1c1e', '#343437', '#4fa3e0'] },
  { id: 'contrast', label: 'High contrast', swatch: ['#000000', '#5c5c5c', '#ffd400'] },
];

function applyUiTheme(name: UiTheme) {
  document.documentElement.dataset.uiTheme = name;
}

function applyContentTheme(name: ContentTheme) {
  let style = document.getElementById('theme-style') as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = 'theme-style';
    document.head.appendChild(style);
  }
  style.textContent = THEME_CSS[name] ?? THEME_CSS['nocturne'];
}

// Windows paths are case-insensitive; compare normalised so one file never gets two tabs.
const CASE_INSENSITIVE_FS = /windows/i.test(navigator.userAgent);
function pathKey(p: string): string {
  const n = p.replace(/\\/g, '/');
  return CASE_INSENSITIVE_FS ? n.toLowerCase() : n;
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

function ExplorerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round">
      <path d="M9.5 1.5h-5v10h8v-7z" /><path d="M9.5 1.5v3h3" /><path d="M3 4v10.5h8" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <circle cx="6.5" cy="6.5" r="4" /><path d="M9.5 9.5l5 5" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round">
      <path d="M6.97 2.70 L7.10 0.66 L8.90 0.66 L9.03 2.70 L11.02 3.52 L12.56 2.17 L13.83 3.44 L12.48 4.98 L13.30 6.97 L15.34 7.10 L15.34 8.90 L13.30 9.03 L12.48 11.02 L13.83 12.56 L12.56 13.83 L11.02 12.48 L9.03 13.30 L8.90 15.34 L7.10 15.34 L6.97 13.30 L4.98 12.48 L3.44 13.83 L2.17 12.56 L3.52 11.02 L2.70 9.03 L0.66 8.90 L0.66 7.10 L2.70 6.97 L3.52 4.98 L2.17 3.44 L3.44 2.17 L4.98 3.52 Z" />
      <circle cx="8" cy="8" r="2.3" />
    </svg>
  );
}

type SidebarView = 'explorer' | 'search';

interface FileData {
  content: string;
  lineCount: number;
}

export function App() {
  const [rootFolder, setRootFolder] = useState<string>('');
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [fileCache, setFileCache] = useState<Record<string, FileData>>({});
  const [scrollPositions, setScrollPositions] = useState<Record<string, number>>({});
  const [contentTheme, setContentTheme] = useState<ContentTheme>('nocturne');
  const [treeMode, setTreeMode] = useState<'md-only' | 'full'>('md-only');
  const [openPathError, setOpenPathError] = useState<string>('');
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [uiTheme, setUiTheme] = useState<UiTheme>('nocturne');
  const [isTreeLoading, setIsTreeLoading] = useState(false);
  const [treeRefreshKey, setTreeRefreshKey] = useState(0);
  const [sidebarView, setSidebarView] = useState<SidebarView | null>('explorer');
  const sidebarRef = usePanelRef();
  const [startupPrompt, setStartupPrompt] = useState<AppState | null>(null);
  const initialized = useRef(false);
  const tabsRef = useRef<Tab[]>([]);
  const treeModeRef = useRef<'md-only' | 'full'>('md-only');
  const folderLoaded = useRef(false);

  const persistState = useCallback((patch: Partial<AppState>) => {
    window.api.setState(patch);
  }, []);

  // Folder contents are listed lazily by the tree, so opening a folder is instant.
  const loadFolder = useCallback((folderPath: string, _mode?: 'md-only' | 'full'): boolean => {
    folderLoaded.current = true;
    setRootFolder(folderPath);
    persistState({ lastFolder: folderPath });
    return true;
  }, [persistState]);

  const openNewFolder = useCallback((folder: string) => {
    loadFolder(folder);
    setTabs([]);
    setActiveTab(null);
    setFileCache({});
    persistState({ openTabs: [], activeTab: '' });
  }, [loadFolder, persistState]);

  const restorePrevious = useCallback(async (state: AppState) => {
    setStartupPrompt(null);
    const folder = state.lastFolder;
    if (!folder) return;
    loadFolder(folder);
    if (!state.openTabs || state.openTabs.length === 0) return;
    const restoredTabs: Tab[] = [];
    for (const absPath of state.openTabs) {
      try {
        const data = await window.api.readFile(absPath);
        const rel = absPath.replace(folder, '').replace(/^[/\\]/, '').replace(/\\/g, '/');
        restoredTabs.push({ absolutePath: absPath, relativePath: rel, name: basename(rel) });
        setFileCache(prev => ({ ...prev, [absPath]: { content: data.content, lineCount: data.lineCount } }));
      } catch { /* file gone, skip */ }
    }
    setTabs(restoredTabs);
    const activeExists = restoredTabs.find(t => t.absolutePath === state.activeTab);
    setActiveTab(activeExists ? state.activeTab : (restoredTabs[0]?.absolutePath ?? null));
  }, [loadFolder]);

  const chooseOtherFolder = useCallback(async () => {
    setStartupPrompt(null);
    const folder = await window.api.openFolderDialog();
    if (folder) openNewFolder(folder);
  }, [openNewFolder]);

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
    // tabsRef is updated synchronously so rapid repeated opens of one file can't create duplicates
    const existing = tabsRef.current.find(t => pathKey(t.absolutePath) === pathKey(absolutePath));
    if (existing) {
      setActiveTab(existing.absolutePath);
      persistState({ activeTab: existing.absolutePath });
      return;
    }
    const name = basename(relativePath);
    const newTab: Tab = { absolutePath, relativePath, name };
    const newTabs = [...tabsRef.current, newTab];
    tabsRef.current = newTabs;
    setTabs(newTabs);
    setActiveTab(absolutePath);
    await loadFile(absolutePath);
    persistState({
      openTabs: newTabs.map(t => t.absolutePath),
      activeTab: absolutePath,
    });
  }, [loadFile, persistState]);

  // Links inside a document open as tabs without touching the folder tree (like external resources).
  const handleLinkClick = useCallback(async (href: string) => {
    if (!activeTab) return;
    const target = await window.api.resolveLink(activeTab, href, rootFolder);
    switch (target.kind) {
      case 'md': await openTab(target.absolutePath, target.relativePath); break;
      case 'file': {
        const err = await window.api.openPath(target.absolutePath);
        if (err) setOpenPathError(err);
        break;
      }
      case 'external': window.api.openExternal(href); break;
      case 'missing': setOpenPathError(`Link target not found: ${target.target}`); break;
    }
  }, [activeTab, rootFolder, openTab]);

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

  const handleUiThemeChange = useCallback((name: UiTheme) => {
    setUiTheme(name);
    applyUiTheme(name);
    persistState({ uiTheme: name });
  }, [persistState]);

  const handleTreeModeToggle = useCallback(() => {
    const next: 'md-only' | 'full' = treeMode === 'md-only' ? 'full' : 'md-only';
    setTreeMode(next);
    persistState({ treeMode: next });
  }, [treeMode, persistState]);

  const handleOpenFolder = useCallback(async () => {
    const folder = await window.api.openFolderDialog();
    if (folder) openNewFolder(folder);
  }, [openNewFolder]);

  const handleRefresh = useCallback(() => {
    if (rootFolder) setTreeRefreshKey(k => k + 1);
  }, [rootFolder]);

  // VS Code-style activity bar: clicking the active view collapses the sidebar.
  const selectSidebarView = useCallback((view: SidebarView) => {
    if (sidebarView === view) {
      setSidebarView(null);
      sidebarRef.current?.collapse();
    } else {
      setSidebarView(view);
      sidebarRef.current?.expand();
    }
  }, [sidebarView, sidebarRef]);

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

      const initUi: UiTheme = UI_THEMES.some(t => t.id === state.uiTheme) ? state.uiTheme : 'nocturne';
      setUiTheme(initUi);
      applyUiTheme(initUi);

      const initMode = state.treeMode || 'md-only';
      setTreeMode(initMode);
      treeModeRef.current = initMode;

      if (state.scrollPositions) setScrollPositions(state.scrollPositions);

      // Ask first rather than silently reopening a previous (possibly huge) folder.
      if (state.lastFolder && !folderLoaded.current) setStartupPrompt(state);
    })();

    const handleSwitcherKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        setShowSwitcher(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleSwitcherKey);

    const handleSearchKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
        e.preventDefault();
        setSidebarView('search');
        sidebarRef.current?.expand();
      }
    };
    window.addEventListener('keydown', handleSearchKey);

    const offCli = window.api.onFolderFromCLI((folder) => {
      setStartupPrompt(null);
      openNewFolder(folder);
    });
    const offMenu = window.api.onOpenFolderFromMenu((folder) => {
      setStartupPrompt(null);
      openNewFolder(folder);
    });
    const offSettings = window.api.onOpenSettings(() => setShowSettings(true));
    const offShortcuts = window.api.onShowShortcuts(() => setShowShortcuts(s => !s));

    return () => {
      window.removeEventListener('keydown', handleSwitcherKey);
      window.removeEventListener('keydown', handleSearchKey);
      offCli(); offMenu(); offShortcuts(); offSettings();
    };
  }, []);

  useEffect(() => { treeModeRef.current = treeMode; }, [treeMode]);

  tabsRef.current = tabs;

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
        <div className="activity-bar">
          <button
            className={`activity-bar__btn${sidebarView === 'explorer' ? ' activity-bar__btn--active' : ''}`}
            onClick={() => selectSidebarView('explorer')}
            title="Explorer"
          ><ExplorerIcon /></button>
          <button
            className={`activity-bar__btn${sidebarView === 'search' ? ' activity-bar__btn--active' : ''}`}
            onClick={() => selectSidebarView('search')}
            title="Search (Ctrl+Shift+F)"
          ><SearchIcon /></button>
          <div className="activity-bar__spacer" />
          <button className="activity-bar__btn" onClick={() => setShowSettings(true)} title="Settings (Ctrl+,)">
            <SettingsIcon />
          </button>
        </div>
        <PanelGroup orientation="horizontal">
          <Panel
            defaultSize={28}
            minSize={15}
            collapsible
            collapsedSize={0}
            panelRef={sidebarRef}
            className="panel panel--tree"
          >
            {/* Both views stay mounted so a running search keeps going while Explorer is shown */}
            <div className="sidebar-view" hidden={sidebarView !== 'explorer'}>
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
                rootFolder={rootFolder}
                mode={treeMode}
                refreshKey={treeRefreshKey}
                onFileSelect={(abs, rel) => openTab(abs, rel)}
                onOpenError={(msg) => setOpenPathError(msg)}
                onLoadingChange={setIsTreeLoading}
              />
            </div>
            <div className="sidebar-view" hidden={sidebarView !== 'search'}>
              <div className="tree-files-header"><span className="tree-files-label">Search</span></div>
              <SearchPanel
                rootFolder={rootFolder}
                active={sidebarView === 'search'}
                onFileSelect={(abs, rel) => openTab(abs, rel)}
              />
            </div>
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
                onLinkClick={handleLinkClick}
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

      {showSettings && (
        <div className="shortcuts-overlay" onClick={() => setShowSettings(false)}>
          <div className="shortcuts-modal settings-modal" onClick={e => e.stopPropagation()}>
            <h2>Settings</h2>
            <div className="settings-row">
              <span className="settings-row__label">Interface theme</span>
              <div className="settings-swatches">
                {UI_THEMES.map(t => (
                  <button
                    key={t.id}
                    className={`settings-swatch${uiTheme === t.id ? ' settings-swatch--active' : ''}`}
                    onClick={() => handleUiThemeChange(t.id)}
                  >
                    <span className="settings-swatch__chip">
                      {t.swatch.map(c => <span key={c} style={{ background: c }} />)}
                    </span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="settings-row">
              <span className="settings-row__label">Document theme</span>
              <select
                className="settings-select"
                value={contentTheme}
                onChange={e => handleContentThemeChange(e.target.value as ContentTheme)}
              >
                {CONTENT_THEMES.map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <button onClick={() => setShowSettings(false)}>Close</button>
          </div>
        </div>
      )}

      {startupPrompt?.lastFolder && (
        <div className="shortcuts-overlay">
          <div className="shortcuts-modal">
            <h2>Open a folder</h2>
            <p className="dialog-text">Reopen the previous folder?</p>
            <p className="dialog-path" title={startupPrompt.lastFolder}>{startupPrompt.lastFolder}</p>
            <div className="dialog-actions">
              <button className="dialog-btn--primary" onClick={() => restorePrevious(startupPrompt)}>Open previous</button>
              <button onClick={chooseOtherFolder}>Choose another…</button>
              <button onClick={() => setStartupPrompt(null)}>Not now</button>
            </div>
          </div>
        </div>
      )}

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
                <tr><td><kbd>Ctrl+,</kbd></td><td>Settings</td></tr>
                <tr><td><kbd>Ctrl+Shift+F</kbd></td><td>Search files</td></tr>
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

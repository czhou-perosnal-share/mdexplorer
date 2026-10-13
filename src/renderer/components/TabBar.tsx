import React, { useEffect, useState, useRef, useCallback } from 'react';

export interface Tab {
  absolutePath: string;
  relativePath: string;
  name: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string | null;
  onTabSelect: (absolutePath: string) => void;
  onTabClose: (absolutePath: string) => void;
  onCloseOthers: (absolutePath: string) => void;
  onCloseToRight: (absolutePath: string) => void;
  onCloseAll: () => void;
}

// Returns displayLabel for each tab. Duplicate filenames get "parentFolder/filename".
// If that's still non-unique, falls back to full relativePath.
function computeLabels(tabs: Tab[]): Record<string, string> {
  const byName: Record<string, Tab[]> = {};
  for (const tab of tabs) {
    (byName[tab.name] ??= []).push(tab);
  }

  const labels: Record<string, string> = {};
  for (const tab of tabs) {
    const group = byName[tab.name];
    if (group.length === 1) {
      labels[tab.absolutePath] = tab.name;
    } else {
      // Use parent folder + filename
      const parts = tab.relativePath.replace(/\\/g, '/').split('/');
      const candidate = parts.length >= 2
        ? `${parts[parts.length - 2]}/${tab.name}`
        : tab.relativePath;
      labels[tab.absolutePath] = candidate;
    }
  }

  // If parent/filename is still non-unique, fall back to full relativePath
  const seen: Record<string, number> = {};
  for (const label of Object.values(labels)) seen[label] = (seen[label] ?? 0) + 1;
  for (const tab of tabs) {
    if (seen[labels[tab.absolutePath]] > 1) {
      labels[tab.absolutePath] = tab.relativePath;
    }
  }

  return labels;
}

interface MenuAnchor { x: number; y: number; tabPath: string }

export function TabBar({ tabs, activeTab, onTabSelect, onTabClose, onCloseOthers, onCloseToRight, onCloseAll }: TabBarProps) {
  const [menuAnchor, setMenuAnchor] = useState<MenuAnchor | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const labels = computeLabels(tabs);

  // Ctrl+Tab, Ctrl+Shift+Tab, Ctrl+W keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (tabs.length === 0) return;
      const activeIdx = tabs.findIndex(t => t.absolutePath === activeTab);
      if (e.ctrlKey && !e.shiftKey && e.key === 'Tab') {
        e.preventDefault();
        onTabSelect(tabs[(activeIdx + 1) % tabs.length].absolutePath);
      } else if (e.ctrlKey && e.shiftKey && e.key === 'Tab') {
        e.preventDefault();
        onTabSelect(tabs[(activeIdx - 1 + tabs.length) % tabs.length].absolutePath);
      } else if (e.ctrlKey && e.key === 'w') {
        e.preventDefault();
        if (activeTab) onTabClose(activeTab);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs, activeTab, onTabSelect, onTabClose]);

  // Close context menu on outside mousedown or Escape
  useEffect(() => {
    if (!menuAnchor) return;
    const onMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAnchor(null);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuAnchor(null);
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuAnchor]);

  const handleContextMenu = useCallback((e: React.MouseEvent, tabPath: string) => {
    e.preventDefault();
    setMenuAnchor({ x: e.clientX, y: e.clientY, tabPath });
  }, []);

  const runMenuAction = useCallback((action: () => void) => {
    setMenuAnchor(null);
    action();
  }, []);

  if (tabs.length === 0) return null;

  return (
    <>
      <div className="tab-bar">
        {tabs.map(tab => (
          <div
            key={tab.absolutePath}
            className={`tab-bar__tab ${tab.absolutePath === activeTab ? 'tab-bar__tab--active' : ''}`}
            onClick={() => onTabSelect(tab.absolutePath)}
            onContextMenu={(e) => handleContextMenu(e, tab.absolutePath)}
            title={tab.relativePath}
          >
            <span className="tab-bar__label">{labels[tab.absolutePath]}</span>
            <button
              className="tab-bar__close"
              onClick={e => { e.stopPropagation(); onTabClose(tab.absolutePath); }}
              aria-label={`Close ${tab.name}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {menuAnchor && (
        <div
          ref={menuRef}
          className="tab-context-menu"
          style={{ left: menuAnchor.x, top: menuAnchor.y }}
        >
          <div className="tab-context-menu__item" onClick={() => runMenuAction(() => onTabClose(menuAnchor.tabPath))}>Close</div>
          <div className="tab-context-menu__item" onClick={() => runMenuAction(() => onCloseOthers(menuAnchor.tabPath))}>Close Others</div>
          <div className="tab-context-menu__item" onClick={() => runMenuAction(() => onCloseToRight(menuAnchor.tabPath))}>Close to the Right</div>
          <div className="tab-context-menu__separator" />
          <div className="tab-context-menu__item" onClick={() => runMenuAction(onCloseAll)}>Close All</div>
        </div>
      )}
    </>
  );
}

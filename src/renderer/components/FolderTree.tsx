import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { TreeNode, FileNode, DirNode, TreeMode } from '../../main';

interface FolderTreeProps {
  rootFolder: string;
  mode: TreeMode;
  /** Bump to re-list the root and every expanded folder. */
  refreshKey: number;
  onFileSelect: (absolutePath: string, relativePath: string) => void;
  onOpenError?: (msg: string) => void;
  onLoadingChange?: (loading: boolean) => void;
}

interface FlatItem {
  node: TreeNode;
  depth: number;
  key: string;
}

function isMdFile(name: string): boolean {
  return name.endsWith('.md');
}

function FolderIcon({ open }: { open: boolean }) {
  return (
    <svg className="folder-tree__icon" width="13" height="13" viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      {open ? <path d="M1.5 12.5v-9h4l1.5 2h7v2M1.5 12.5l2-5h12l-2 5z" /> : <path d="M1.5 3.5h4l1.5 2h7v7h-12.5z" />}
    </svg>
  );
}

function DocIcon() {
  return (
    <svg className="folder-tree__icon" width="13" height="13" viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 1.5h6l3 3v10h-9z" />
      <path d="M9 1.5v3h3" />
    </svg>
  );
}

export function FolderTree({ rootFolder, mode, refreshKey, onFileSelect, onOpenError, onLoadingChange }: FolderTreeProps) {
  // Folder contents are fetched one level at a time, only when a folder is expanded.
  const [children, setChildren] = useState<Record<string, TreeNode[]>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [focusIdx, setFocusIdx] = useState(0);
  const lastClick = useRef<Record<string, number>>({});
  const expandedRef = useRef(expanded);
  expandedRef.current = expanded;
  // Guards against responses from a previous folder/mode landing after a switch.
  const generation = useRef(0);
  const prevContext = useRef({ rootFolder, mode });

  const list = useCallback((dir: string) => window.api.listDir(dir, rootFolder, mode), [rootFolder, mode]);

  useEffect(() => {
    const gen = ++generation.current;
    const contextChanged = prevContext.current.rootFolder !== rootFolder || prevContext.current.mode !== mode;
    prevContext.current = { rootFolder, mode };
    if (!rootFolder) { setChildren({}); setExpanded(new Set()); return; }

    // Switching folder or mode starts from a collapsed root; a plain refresh keeps what is open.
    const dirsToLoad = contextChanged ? [rootFolder] : [rootFolder, ...expandedRef.current];
    if (contextChanged) { setChildren({}); setExpanded(new Set()); }

    onLoadingChange?.(true);
    Promise.all(dirsToLoad.map(async (d) => [d, await list(d)] as const)).then((pairs) => {
      if (gen !== generation.current) return;
      const next: Record<string, TreeNode[]> = {};
      for (const [d, nodes] of pairs) next[d] = nodes;
      setChildren(next);
      // Drop expanded folders that no longer exist
      setExpanded(prev => new Set([...prev].filter(d => d in next)));
      onLoadingChange?.(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootFolder, mode, refreshKey]);

  const toggleDir = useCallback(async (dir: DirNode) => {
    const key = dir.absolutePath;
    if (expandedRef.current.has(key)) {
      setExpanded(prev => { const n = new Set(prev); n.delete(key); return n; });
      return;
    }
    setExpanded(prev => new Set(prev).add(key));
    if (children[key]) return;
    const gen = generation.current;
    setLoading(prev => new Set(prev).add(key));
    const nodes = await list(key);
    if (gen !== generation.current) return;
    setChildren(prev => ({ ...prev, [key]: nodes }));
    setLoading(prev => { const n = new Set(prev); n.delete(key); return n; });
  }, [children, list]);

  const items: FlatItem[] = [];
  const walk = (dir: string, depth: number) => {
    for (const node of children[dir] ?? []) {
      items.push({ node, depth, key: node.absolutePath });
      if (node.type === 'dir' && expanded.has(node.absolutePath)) walk(node.absolutePath, depth + 1);
    }
  };
  walk(rootFolder, 0);

  const activate = useCallback((item: FlatItem) => {
    if (item.node.type === 'dir') { toggleDir(item.node); return; }
    if (isMdFile(item.node.name)) onFileSelect(item.node.absolutePath, item.node.relativePath);
  }, [onFileSelect, toggleDir]);

  const handleClick = useCallback(async (item: FlatItem, idx: number, e: React.MouseEvent) => {
    setFocusIdx(idx);
    if (item.node.type === 'file' && !isMdFile(item.node.name)) {
      // Non-markdown files open externally on double click
      const last = lastClick.current[item.key] ?? 0;
      lastClick.current[item.key] = e.timeStamp;
      if (e.timeStamp - last < 400) {
        const err = await window.api.openPath((item.node as FileNode).absolutePath);
        if (err && onOpenError) onOpenError(err);
      }
      return;
    }
    activate(item);
  }, [activate, onOpenError]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const item = items[focusIdx];
    if (e.key === 'ArrowDown' || e.key === 'j') {
      e.preventDefault(); setFocusIdx(i => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp' || e.key === 'k') {
      e.preventDefault(); setFocusIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'ArrowRight' && item?.node.type === 'dir' && !expanded.has(item.key)) {
      e.preventDefault(); toggleDir(item.node);
    } else if (e.key === 'ArrowLeft' && item?.node.type === 'dir' && expanded.has(item.key)) {
      e.preventDefault(); toggleDir(item.node);
    } else if ((e.key === 'Enter' || e.key === ' ') && item) {
      e.preventDefault(); activate(item);
    }
  }, [items, focusIdx, expanded, activate, toggleDir]);

  if (!rootFolder) {
    return <div className="folder-tree folder-tree--empty"><span>No folder open</span></div>;
  }
  if (items.length === 0 && rootFolder in children) {
    return (
      <div className="folder-tree folder-tree--empty">
        <span>{mode === 'full' ? 'Folder is empty' : 'No Markdown files found'}</span>
      </div>
    );
  }

  return (
    <div className="folder-tree" tabIndex={0} onKeyDown={handleKeyDown}>
      {items.map((item, idx) => {
        const isDir = item.node.type === 'dir';
        const isNonMd = !isDir && !isMdFile(item.node.name);
        return (
          <div
            key={item.key}
            className={[
              'folder-tree__item',
              isDir ? 'folder-tree__item--dir' : 'folder-tree__item--file',
              isNonMd ? 'folder-tree__item--non-md' : '',
              idx === focusIdx ? 'folder-tree__item--focused' : '',
            ].filter(Boolean).join(' ')}
            style={{ paddingLeft: `${item.depth * 14 + 10}px` }}
            onClick={(e) => handleClick(item, idx, e)}
            title={item.node.relativePath}
          >
            {isDir ? <FolderIcon open={expanded.has(item.key)} /> : <DocIcon />}
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.node.name}</span>
            {isDir && loading.has(item.key) && <span className="tree-bin-tag">…</span>}
            {isNonMd && <span className="tree-bin-tag">bin</span>}
          </div>
        );
      })}
    </div>
  );
}

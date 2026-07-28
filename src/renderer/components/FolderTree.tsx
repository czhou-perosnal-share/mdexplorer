import React, { useState, useCallback, useRef } from 'react';
import type { TreeNode, FileNode, DirNode } from '../../main';

interface FolderTreeProps {
  tree: TreeNode[];
  mode: 'md-only' | 'full';
  filterQuery: string;
  onFileSelect: (absolutePath: string, relativePath: string) => void;
  onOpenError?: (msg: string) => void;
}

interface FlatItem {
  node: TreeNode;
  depth: number;
  key: string;
}

function flatten(nodes: TreeNode[], depth: number, expanded: Set<string>): FlatItem[] {
  const result: FlatItem[] = [];
  for (const node of nodes) {
    const key = node.type === 'file' ? (node as FileNode).absolutePath : `dir:${(node as DirNode).name}:${depth}`;
    result.push({ node, depth, key });
    if (node.type === 'dir' && expanded.has(key)) {
      result.push(...flatten((node as DirNode).children, depth + 1, expanded));
    }
  }
  return result;
}

function flattenAllFiles(nodes: TreeNode[]): FileNode[] {
  const result: FileNode[] = [];
  for (const node of nodes) {
    if (node.type === 'file') result.push(node as FileNode);
    else result.push(...flattenAllFiles((node as DirNode).children));
  }
  return result;
}

function buildTopLevelExpandedSet(nodes: TreeNode[]): Set<string> {
  const s = new Set<string>();
  for (const node of nodes) {
    if (node.type === 'dir') s.add(`dir:${(node as DirNode).name}:0`);
  }
  return s;
}

function isMdFile(name: string): boolean {
  return name.endsWith('.md');
}

function FolderIcon() {
  return (
    <svg className="folder-tree__icon" width="13" height="13" viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 3.5h4l1.5 2h7v7h-12.5z" />
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

export function FolderTree({ tree, mode, filterQuery, onFileSelect, onOpenError }: FolderTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => buildTopLevelExpandedSet(tree));
  const [focusIdx, setFocusIdx] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const lastClick = useRef<Record<string, number>>({});

  // Always compute items (cheap) so hooks below can always reference it
  const items = flatten(tree, 0, expanded);
  const q = filterQuery.trim().toLowerCase();

  const toggleDir = useCallback((key: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const activateMd = useCallback((item: FlatItem) => {
    if (item.node.type === 'file') {
      const f = item.node as FileNode;
      onFileSelect(f.absolutePath, f.relativePath);
    } else {
      toggleDir(item.key);
    }
  }, [onFileSelect, toggleDir]);

  const handleClick = useCallback((item: FlatItem, idx: number) => {
    setFocusIdx(idx);
    if (item.node.type === 'dir') { toggleDir(item.key); return; }
    const f = item.node as FileNode;
    if (isMdFile(f.name)) onFileSelect(f.absolutePath, f.relativePath);
  }, [onFileSelect, toggleDir]);

  const handleDoubleClick = useCallback(async (item: FlatItem) => {
    if (item.node.type !== 'file') return;
    const f = item.node as FileNode;
    if (!isMdFile(f.name)) {
      const err = await window.api.openPath(f.absolutePath);
      if (err && onOpenError) onOpenError(err);
    }
  }, [onOpenError]);

  const handleClickWithDblDetect = useCallback((item: FlatItem, idx: number, e: React.MouseEvent) => {
    if (item.node.type === 'file' && !isMdFile((item.node as FileNode).name)) {
      const now = e.timeStamp;
      const last = lastClick.current[item.key] ?? 0;
      lastClick.current[item.key] = now;
      if (now - last < 400) { handleDoubleClick(item); return; }
    }
    handleClick(item, idx);
  }, [handleClick, handleDoubleClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'j') {
      e.preventDefault(); setFocusIdx(i => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp' || e.key === 'k') {
      e.preventDefault(); setFocusIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); if (items[focusIdx]) activateMd(items[focusIdx]);
    }
  }, [items, focusIdx, activateMd]);

  /* Filter mode — all hooks already called above */
  if (q) {
    const allFiles = flattenAllFiles(tree);
    const matches = allFiles.filter(f => f.name.toLowerCase().includes(q));

    if (matches.length === 0) {
      return (
        <div className="folder-tree folder-tree--empty">
          <span>No files match "{filterQuery}"</span>
        </div>
      );
    }

    return (
      <div className="folder-tree" tabIndex={0} ref={listRef}>
        {matches.map((f, idx) => (
          <div
            key={f.absolutePath}
            className={[
              'folder-tree__item',
              isMdFile(f.name) ? 'folder-tree__item--file' : 'folder-tree__item--non-md',
              idx === focusIdx ? 'folder-tree__item--focused' : '',
            ].filter(Boolean).join(' ')}
            style={{ paddingLeft: '10px' }}
            onClick={() => {
              setFocusIdx(idx);
              if (isMdFile(f.name)) onFileSelect(f.absolutePath, f.relativePath);
            }}
            title={f.relativePath}
          >
            <DocIcon />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
            {!isMdFile(f.name) && (
              <span className="tree-bin-tag">bin</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  /* Normal tree mode */
  if (tree.length === 0) {
    return (
      <div className="folder-tree folder-tree--empty">
        <span>{mode === 'full' ? 'Folder is empty' : 'No Markdown files found'}</span>
      </div>
    );
  }

  return (
    <div className="folder-tree" tabIndex={0} onKeyDown={handleKeyDown} ref={listRef}>
      {items.map((item, idx) => {
        const isDir = item.node.type === 'dir';
        const fileName = isDir ? (item.node as DirNode).name : (item.node as FileNode).name;
        const isNonMd = !isDir && !isMdFile(fileName);

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
            onClick={(e) => handleClickWithDblDetect(item, idx, e)}
            title={item.node.type === 'file' ? (item.node as FileNode).relativePath : undefined}
          >
            {isDir ? <FolderIcon /> : <DocIcon />}
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName}</span>
            {isNonMd && <span className="tree-bin-tag">bin</span>}
          </div>
        );
      })}
    </div>
  );
}

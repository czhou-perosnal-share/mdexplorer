import React, { useState, useEffect, useRef } from 'react';
import type { Tab } from './TabBar';

interface TabSwitcherProps {
  tabs: Tab[];
  onActivate: (absolutePath: string) => void;
  onClose: () => void;
}

export function TabSwitcher({ tabs, onActivate, onClose }: TabSwitcherProps) {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = tabs.filter(t =>
    t.relativePath.toLowerCase().includes(query.toLowerCase())
  );

  // Reset selection when filter changes
  useEffect(() => { setSelectedIdx(0); }, [query]);

  // Auto-focus input on mount
  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const activate = (absolutePath: string) => {
    onActivate(absolutePath);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIdx]) activate(filtered[selectedIdx].absolutePath);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="tab-switcher-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="tab-switcher-modal">
        <input
          ref={inputRef}
          className="tab-switcher__input"
          placeholder="Search open tabs…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="tab-switcher__list">
          {filtered.length === 0 ? (
            <div className="tab-switcher__empty">No matching tabs</div>
          ) : (
            filtered.map((tab, idx) => (
              <div
                key={tab.absolutePath}
                className={`tab-switcher__item${idx === selectedIdx ? ' tab-switcher__item--selected' : ''}`}
                onMouseDown={() => activate(tab.absolutePath)}
                onMouseEnter={() => setSelectedIdx(idx)}
              >
                {tab.relativePath}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

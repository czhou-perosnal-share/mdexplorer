import { describe, it, expect } from 'vitest';
import type { Tab } from '../renderer/components/TabBar';

function openTab(tabs: Tab[], absolutePath: string, relativePath: string): { tabs: Tab[]; activeTab: string } {
  const existing = tabs.find(t => t.absolutePath === absolutePath);
  if (existing) {
    return { tabs, activeTab: absolutePath };
  }
  const name = absolutePath.split('/').pop() || absolutePath;
  return { tabs: [...tabs, { absolutePath, relativePath, name }], activeTab: absolutePath };
}

function closeTab(tabs: Tab[], activeTab: string, toClose: string): { tabs: Tab[]; activeTab: string | null } {
  const idx = tabs.findIndex(t => t.absolutePath === toClose);
  if (idx === -1) return { tabs, activeTab };
  const next = tabs.filter(t => t.absolutePath !== toClose);
  if (next.length === 0) return { tabs: [], activeTab: null };
  const newActive = activeTab === toClose
    ? next[Math.min(idx, next.length - 1)].absolutePath
    : activeTab;
  return { tabs: next, activeTab: newActive };
}

describe('openTab', () => {
  it('opens a new tab and makes it active', () => {
    const { tabs, activeTab } = openTab([], '/docs/a.md', 'docs/a.md');
    expect(tabs).toHaveLength(1);
    expect(activeTab).toBe('/docs/a.md');
  });

  it('deduplicates: activates existing tab without adding duplicate', () => {
    const initial = [{ absolutePath: '/docs/a.md', relativePath: 'docs/a.md', name: 'a.md' }];
    const { tabs, activeTab } = openTab(initial, '/docs/a.md', 'docs/a.md');
    expect(tabs).toHaveLength(1);
    expect(activeTab).toBe('/docs/a.md');
  });
});

describe('closeTab', () => {
  const tabs: Tab[] = [
    { absolutePath: '/a.md', relativePath: 'a.md', name: 'a.md' },
    { absolutePath: '/b.md', relativePath: 'b.md', name: 'b.md' },
    { absolutePath: '/c.md', relativePath: 'c.md', name: 'c.md' },
  ];

  it('closes a tab and moves focus to the next one', () => {
    const { tabs: next, activeTab } = closeTab(tabs, '/b.md', '/b.md');
    expect(next).toHaveLength(2);
    expect(activeTab).toBe('/c.md');
  });

  it('closing last tab returns empty state', () => {
    const single = [tabs[0]];
    const { tabs: next, activeTab } = closeTab(single, '/a.md', '/a.md');
    expect(next).toHaveLength(0);
    expect(activeTab).toBeNull();
  });

  it('closing non-active tab does not change active tab', () => {
    const { activeTab } = closeTab(tabs, '/a.md', '/b.md');
    expect(activeTab).toBe('/a.md');
  });
});

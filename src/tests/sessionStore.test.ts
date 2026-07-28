import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('electron-store', () => {
  return {
    default: class MockStore {
      private data: Record<string, unknown>;
      constructor({ defaults }: { defaults: Record<string, unknown> }) {
        this.data = { ...defaults };
      }
      get(key: string, fallback?: unknown) {
        return key in this.data ? this.data[key] : fallback;
      }
      set(key: string, value: unknown) {
        this.data[key] = value;
      }
    },
  };
});

describe('getState / setState', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns defaults when nothing is set', async () => {
    const { getState } = await import('../main/store');
    const state = getState();
    expect(state.contentTheme).toBe('nocturne');
    expect(state.openTabs).toEqual([]);
    expect(state.lastFolder).toBe('');
  });

  it('setState persists partial updates', async () => {
    const { getState, setState } = await import('../main/store');
    setState({ contentTheme: 'nord', lastFolder: '/docs' });
    const state = getState();
    expect(state.contentTheme).toBe('nord');
    expect(state.lastFolder).toBe('/docs');
  });

  it('missing keys fall back to defaults', async () => {
    const { getState } = await import('../main/store');
    const state = getState();
    expect(state.scrollPositions).toEqual({});
  });
});

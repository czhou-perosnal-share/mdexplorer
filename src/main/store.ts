import Store from 'electron-store';

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ContentTheme = 'nocturne' | 'github' | 'nord' | 'dracula' | 'plain';

export interface AppState {
  lastFolder: string;
  openTabs: string[];
  activeTab: string;
  scrollPositions: Record<string, number>;
  contentTheme: ContentTheme;
  treeMode: 'md-only' | 'full';
  windowBounds: WindowBounds;
}

const defaults: AppState = {
  lastFolder: '',
  openTabs: [],
  activeTab: '',
  scrollPositions: {},
  contentTheme: 'nocturne',
  treeMode: 'md-only',
  windowBounds: { x: undefined as unknown as number, y: undefined as unknown as number, width: 1200, height: 800 },
};

export const store = new Store<AppState>({ defaults });

export function getState(): AppState {
  return {
    lastFolder: store.get('lastFolder', defaults.lastFolder),
    openTabs: store.get('openTabs', defaults.openTabs),
    activeTab: store.get('activeTab', defaults.activeTab),
    scrollPositions: store.get('scrollPositions', defaults.scrollPositions),
    contentTheme: store.get('contentTheme', defaults.contentTheme),
    treeMode: store.get('treeMode', defaults.treeMode),
    windowBounds: store.get('windowBounds', defaults.windowBounds),
  };
}

export function setState(partial: Partial<AppState>): void {
  for (const [key, value] of Object.entries(partial)) {
    store.set(key as keyof AppState, value);
  }
}

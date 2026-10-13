# Markdown showcase

A tour of what MdExplorer renders.

## Text

Plain text with **bold**, *italic*, ~~strikethrough~~ and `inline code`.

## Lists

- Fruits
  - Apple
  - Banana
- Vegetables

1. First
2. Second
3. Third

## Code

```typescript
interface Tab {
  absolutePath: string;
  name: string;
}

export function openTab(tabs: Tab[], path: string): Tab[] {
  return tabs.some(t => t.absolutePath === path)
    ? tabs
    : [...tabs, { absolutePath: path, name: path.split('/').pop()! }];
}
```

```bash
npm install && npm run make
```

## Table

| Theme | Kind | Default |
|---|---|---|
| Nocturne | Interface + document | yes |
| Light | Interface | |
| GitHub | Document | |
| Dracula | Document | |

## Quote

> Simplicity is prerequisite for reliability.
> — Edsger W. Dijkstra

---

See the [API reference](api/endpoints.md) or go back to [Getting started](../guide/getting-started.md).

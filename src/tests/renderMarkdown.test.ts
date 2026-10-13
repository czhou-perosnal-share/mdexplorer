import { describe, it, expect } from 'vitest';
import { renderMarkdown } from '../renderer/lib/renderMarkdown';

describe('renderMarkdown', () => {
  it('renders h1 heading', () => {
    const { html } = renderMarkdown('# Hello World');
    expect(html).toContain('<h1>Hello World</h1>');
  });

  it('renders fenced code block with highlight.js classes', () => {
    const { html } = renderMarkdown('```python\nprint("hello")\n```');
    expect(html).toContain('class="hljs');
    expect(html).toContain('print');
  });

  it('strips script tags (XSS prevention)', () => {
    const { html } = renderMarkdown('<script>alert("xss")</script>');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('alert');
  });

  it('strips on* attributes', () => {
    const { html } = renderMarkdown('<img src="x" onerror="alert(1)">');
    expect(html).not.toContain('onerror');
  });

  it('does not include truncation warning', () => {
    const { html } = renderMarkdown('Some content');
    expect(html).not.toContain('truncation-warning');
  });
});

describe('frontmatter rendering', () => {
  const skillFrontmatter = `---
name: openspec-apply-change
description: Implement tasks from an OpenSpec change.
allowed-tools: Bash(openspec:*)
license: MIT
compatibility: Requires openspec CLI.
---

# Body heading`;

  it('renders frontmatter as a table', () => {
    const { html } = renderMarkdown(skillFrontmatter);
    expect(html).toContain('frontmatter-wrapper');
    expect(html).toContain('frontmatter-table');
    expect(html).toContain('<th>Key</th>');
    expect(html).toContain('<th>Value</th>');
  });

  it('shows each frontmatter key in the table', () => {
    const { html } = renderMarkdown(skillFrontmatter);
    expect(html).toContain('name');
    expect(html).toContain('openspec-apply-change');
    expect(html).toContain('license');
    expect(html).toContain('MIT');
  });

  it('does not render the raw --- delimiters as visible text', () => {
    const { html } = renderMarkdown(skillFrontmatter);
    expect(html).not.toMatch(/^---$/m);
  });

  it('still renders the document body after frontmatter', () => {
    const { html } = renderMarkdown(skillFrontmatter);
    expect(html).toContain('<h1>Body heading</h1>');
  });

  it('file without frontmatter is unaffected', () => {
    const { html } = renderMarkdown('# Just a heading\n\nSome text.');
    expect(html).not.toContain('frontmatter-table');
    expect(html).toContain('<h1>Just a heading</h1>');
  });

  it('frontmatter with value containing colons does not crash', () => {
    const content = `---
url: https://example.com/path
note: key: value: more
---

Body.`;
    expect(() => renderMarkdown(content)).not.toThrow();
    const { html } = renderMarkdown(content);
    expect(html).toContain('https://example.com/path');
  });

  it('metadata block with nested yaml renders as raw string', () => {
    const content = `---
metadata:
  author: openspec
  version: "1.0"
---

Body.`;
    expect(() => renderMarkdown(content)).not.toThrow();
    const { html } = renderMarkdown(content);
    expect(html).toContain('frontmatter-table');
  });
});

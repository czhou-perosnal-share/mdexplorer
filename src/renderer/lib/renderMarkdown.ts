import { marked, Renderer } from 'marked';
import hljs from 'highlight.js';

const renderer = new Renderer();

renderer.code = function ({ text, lang }: { text: string; lang?: string }): string {
  const validLang = lang && hljs.getLanguage(lang);
  const highlighted = validLang
    ? hljs.highlight(text, { language: lang! }).value
    : hljs.highlightAuto(text).value;
  const cls = lang ? ` class="hljs language-${lang}"` : ' class="hljs"';
  return `<pre><code${cls}>${highlighted}</code></pre>`;
};

marked.use({ renderer, gfm: true, breaks: false });

const SCRIPT_RE = /<script[\s\S]*?>[\s\S]*?<\/script>/gi;
const ON_ATTR_RE = /\s+on\w+="[^"]*"/gi;

function sanitize(html: string): string {
  return html.replace(SCRIPT_RE, '').replace(ON_ATTR_RE, '');
}

// Matches a YAML frontmatter block at the very start of the file.
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---(\r?\n|$)/;

interface FrontmatterPair {
  key: string;
  value: string;
}

function extractFrontmatter(content: string): { pairs: FrontmatterPair[]; body: string } {
  const match = FRONTMATTER_RE.exec(content);
  if (!match) return { pairs: [], body: content };

  const yaml = match[1];
  const body = content.slice(match[0].length);

  const pairs: FrontmatterPair[] = [];
  for (const line of yaml.split(/\r?\n/)) {
    const colonIdx = line.indexOf(': ');
    if (colonIdx === -1) {
      // line with no ': ' — could be a bare key or continuation; skip blank lines
      if (line.trim() && !line.startsWith(' ') && !line.startsWith('-')) {
        const bareKey = line.replace(/:$/, '').trim();
        if (bareKey) pairs.push({ key: bareKey, value: '' });
      }
      continue;
    }
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 2).trim();
    pairs.push({ key, value });
  }

  return { pairs, body };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildFrontmatterTable(pairs: FrontmatterPair[]): string {
  if (pairs.length === 0) return '';
  const rows = pairs
    .map(p => `<tr><td class="frontmatter-key">${escapeHtml(p.key)}</td><td class="frontmatter-value">${escapeHtml(p.value)}</td></tr>`)
    .join('');
  return `<div class="frontmatter-wrapper"><table class="frontmatter-table"><thead><tr><th>Key</th><th>Value</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

export interface RenderResult {
  html: string;
}

export function renderMarkdown(content: string): RenderResult {
  const { pairs, body } = extractFrontmatter(content);
  const frontmatterHtml = buildFrontmatterTable(pairs);
  const raw = marked.parse(body) as string;
  const safe = sanitize(raw);
  return { html: frontmatterHtml + safe };
}

import React, { useEffect, useRef, useCallback } from 'react';
import { renderMarkdown } from '../lib/renderMarkdown';

interface MarkdownViewerProps {
  content: string;
  lineCount: number;
  relativePath: string;
  initialScroll?: number;
  onScrollChange: (px: number) => void;
}

function debounce<T extends (...args: Parameters<T>) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

export function MarkdownViewer({
  content,
  lineCount,
  relativePath,
  initialScroll,
  onScrollChange,
}: MarkdownViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { html } = renderMarkdown(content);

  useEffect(() => {
    if (scrollRef.current && initialScroll !== undefined) {
      scrollRef.current.scrollTop = initialScroll;
    }
  }, [relativePath]);

  const debouncedScroll = useCallback(
    debounce((px: number) => onScrollChange(px), 500),
    [onScrollChange]
  );

  const handleScroll = () => {
    if (scrollRef.current) {
      debouncedScroll(scrollRef.current.scrollTop);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    switch (e.key) {
      case 'ArrowDown': case 'j': e.preventDefault(); el.scrollTop += 40; break;
      case 'ArrowUp': case 'k': e.preventDefault(); el.scrollTop -= 40; break;
      case 'PageDown': e.preventDefault(); el.scrollTop += el.clientHeight; break;
      case 'PageUp': e.preventDefault(); el.scrollTop -= el.clientHeight; break;
      case 'Home': e.preventDefault(); el.scrollTop = 0; break;
      case 'End': case 'G': e.preventDefault(); el.scrollTop = el.scrollHeight; break;
    }
  };

  return (
    <div className="md-viewer">
      <div
        className="md-viewer__content"
        ref={scrollRef}
        tabIndex={0}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
      >
        <div
          className="viewer-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}

export function EmptyViewer() {
  return (
    <div className="md-viewer md-viewer--empty">
      <div className="empty-viewer">
        <span>Open a folder to browse markdown files</span>
        <span>Use <kbd className="empty-hint-kbd">Ctrl+O</kbd> or click <strong>Open Folder</strong></span>
      </div>
    </div>
  );
}

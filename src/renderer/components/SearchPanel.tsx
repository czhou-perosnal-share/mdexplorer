import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { SearchHit } from '../../main';

interface SearchPanelProps {
  rootFolder: string;
  /** True while this panel is the visible sidebar view (used to focus the input). */
  active: boolean;
  onFileSelect: (absolutePath: string, relativePath: string) => void;
}

type Status = 'idle' | 'running' | 'done' | 'cancelled';

// Kept mounted while hidden, so a search keeps streaming results while the user works in the Explorer.
export function SearchPanel({ rootFolder, active, onFileSelect }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [contents, setContents] = useState(false);
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [scanned, setScanned] = useState(0);
  const [truncated, setTruncated] = useState(false);
  const searchId = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (active) inputRef.current?.focus(); }, [active]);

  useEffect(() => {
    const offHits = window.api.onSearchHits((id, batch) => {
      if (id === searchId.current) setHits(prev => prev.concat(batch));
    });
    const offDone = window.api.onSearchDone((done) => {
      if (done.id !== searchId.current) return;
      setStatus(done.cancelled ? 'cancelled' : 'done');
      setScanned(done.scanned);
      setTruncated(done.truncated);
    });
    return () => { offHits(); offDone(); };
  }, []);

  // Debounced search-as-you-type; restarts when the query, options or folder change.
  useEffect(() => {
    const q = query.trim();
    const id = ++searchId.current;
    setHits([]);
    setTruncated(false);
    if (!q || !rootFolder) {
      window.api.searchCancel();
      setStatus('idle');
      return;
    }
    const timer = setTimeout(() => {
      setStatus('running');
      window.api.searchStart({ id, root: rootFolder, query: q, contents });
    }, 250);
    return () => clearTimeout(timer);
  }, [query, contents, rootFolder]);

  const stop = useCallback(() => { window.api.searchCancel(); }, []);

  return (
    <div className="search-panel">
      <div className="search-panel__inputs">
        <input
          ref={inputRef}
          className="tree-filter"
          type="text"
          placeholder={rootFolder ? 'Search Markdown files…' : 'Open a folder to search'}
          disabled={!rootFolder}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Escape') setQuery(''); }}
        />
        <label className="search-panel__option">
          <input type="checkbox" checked={contents} onChange={e => setContents(e.target.checked)} />
          Also search file contents
        </label>
      </div>

      <div className="search-panel__status">
        {status === 'running' && (
          <>
            <span className="search-panel__spinner" />
            <span>Searching… {hits.length.toLocaleString()} found</span>
            <button className="search-panel__stop" onClick={stop}>Stop</button>
          </>
        )}
        {status === 'done' && (
          <span>
            {hits.length.toLocaleString()} result{hits.length === 1 ? '' : 's'}
            {truncated ? ' (limited — refine your search)' : ` in ${scanned.toLocaleString()} files`}
          </span>
        )}
        {status === 'cancelled' && <span>Stopped — {hits.length.toLocaleString()} found</span>}
      </div>

      <div className="search-panel__results">
        {hits.map(h => {
          return (
            <div
              key={h.absolutePath}
              className="search-hit"
              title={h.relativePath}
              onClick={() => onFileSelect(h.absolutePath, h.relativePath)}
            >
              <div className="search-hit__name">{h.name}<span className="search-hit__path">{h.relativePath}</span></div>
              {h.line && <div className="search-hit__line"><span>{h.lineNo}</span>{h.line}</div>}
            </div>
          );
        })}
        {status === 'done' && hits.length === 0 && <div className="search-panel__empty">No results</div>}
      </div>
    </div>
  );
}

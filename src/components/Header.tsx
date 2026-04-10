import React, { useRef } from 'react';

interface HeaderProps {
  isSimulating: boolean;
  apiConnected: boolean | null;
  onSearch: (q: string) => void;
  searchQuery: string;
}

export function Header({ isSimulating, apiConnected, onSearch, searchQuery }: HeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span className={`status-pill ${isSimulating ? 'running' : 'idle'}`}>
          {isSimulating && (
            <span className="pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-sage)', display: 'inline-block' }} />
          )}
          {isSimulating ? 'Simulation Running' : 'Lab Idle'}
        </span>

        <span style={{ color: 'var(--rule)', fontSize: 18, lineHeight: 1 }}>│</span>

        <span className={`status-pill ${apiConnected === true ? 'connected' : apiConnected === false ? 'error' : 'idle'}`}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: apiConnected === true ? 'var(--accent-sage)' : apiConnected === false ? 'var(--accent)' : 'var(--ink-muted)',
            display: 'inline-block',
          }} />
          {apiConnected === true ? 'Worker Online' : apiConnected === false ? 'Worker Offline' : 'Checking…'}
        </span>

        <span style={{ color: 'var(--rule)', fontSize: 18, lineHeight: 1 }}>│</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--ink-muted)', fontWeight: 500 }}>Node:</span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11.5, color: 'var(--ink-mid)', fontWeight: 500,
            background: 'var(--paper)', padding: '2px 8px',
            borderRadius: 'var(--radius-xs)',
          }}>
            K2-US-WEST-01
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 14px',
            background: 'var(--paper)',
            border: '1px solid var(--rule)',
            borderRadius: 'var(--radius-md)',
            cursor: 'text',
          }}
          onClick={() => inputRef.current?.focus()}
        >
          <input
            ref={inputRef}
            placeholder="Search experiments…"
            value={searchQuery}
            onChange={e => onSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') onSearch(''); }}
            style={{
              background: 'none', border: 'none', outline: 'none',
              fontSize: 13, color: 'var(--ink)', width: 180,
              fontFamily: 'var(--font-body)',
            }}
          />
          {searchQuery && (
            <button
              onClick={e => { e.stopPropagation(); onSearch(''); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', fontSize: 14, lineHeight: 1, padding: 0 }}
            >
              ×
            </button>
          )}
        </div>

        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'var(--ink)', color: 'var(--white)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700,
          fontFamily: 'var(--font-display)',
          cursor: 'pointer',
          letterSpacing: '-0.02em',
        }}>
          SS
        </div>
      </div>
    </header>
  );
}

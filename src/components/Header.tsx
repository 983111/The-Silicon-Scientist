import React from 'react';

interface HeaderProps {
  isSimulating: boolean;
  apiConnected: boolean;
}

export function Header({ isSimulating, apiConnected }: HeaderProps) {
  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span className={`status-pill ${isSimulating ? 'running' : 'idle'}`}>
          {isSimulating && (
            <span
              className="pulse"
              style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-sage)', display: 'inline-block' }}
            />
          )}
          {isSimulating ? 'Simulation Running' : 'Lab Idle'}
        </span>

        <span style={{ color: 'var(--rule)', fontSize: 18, lineHeight: 1 }}>│</span>

        <span className={`status-pill ${apiConnected ? 'connected' : 'error'}`}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: apiConnected ? 'var(--accent-sage)' : 'var(--accent)',
            display: 'inline-block',
          }} />
          {apiConnected ? 'API Online' : 'API Offline'}
        </span>

        <span style={{ color: 'var(--rule)', fontSize: 18, lineHeight: 1 }}>│</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--ink-muted)', fontWeight: 500 }}>Node:</span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11.5,
            color: 'var(--ink-mid)',
            fontWeight: 500,
            background: 'var(--paper)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-xs)',
          }}>
            K2-US-WEST-01
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 14px',
          background: 'var(--paper)',
          border: '1px solid var(--rule)',
          borderRadius: 'var(--radius-md)',
        }}>
          <span style={{ fontSize: 13, color: 'var(--ink-muted)' }}>🔍</span>
          <input
            id="header-search"
            placeholder="Search experiments..."
            style={{
              background: 'none', border: 'none', outline: 'none',
              fontSize: 13, color: 'var(--ink)',
              width: 180, fontFamily: 'var(--font-body)',
            }}
          />
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

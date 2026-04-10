import React, { useEffect, useMemo, useState } from 'react';
import { getRuntimeState } from '../lib/runtimeData';

export function ToolStreamView() {
  const [version, setVersion] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const onUpdate = () => setVersion(v => v + 1);
    window.addEventListener('silicon:data-updated', onUpdate);
    return () => window.removeEventListener('silicon:data-updated', onUpdate);
  }, []);

  const calls = useMemo(() => getRuntimeState().toolCalls, [version]);
  const filtered = calls.filter(c => filterStatus === 'all' || c.status.toLowerCase() === filterStatus);

  return (
    <div className="scroll-area" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Tool Execution Stream</h1>
        <div style={{ display: 'flex', gap: 8 }}>{['all', 'ok', 'error'].map(s => <button key={s} className={`tab-btn ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>{s}</button>)}</div>
      </div>
      <div className="card" style={{ overflow: 'hidden' }}>
        {filtered.length === 0 && <div style={{ padding: 20, color: 'var(--ink-muted)' }}>No tool calls yet.</div>}
        {[...filtered].reverse().map((tool, i) => (
          <div key={`${tool.at}-${i}`} style={{ padding: '12px 16px', borderBottom: '1px solid var(--rule-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>{tool.name}</strong>
              <span className={`tag ${tool.status === 'OK' ? 'green' : 'red'}`}>{tool.status}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 4 }}>{tool.desc}</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>{new Date(tool.at).toLocaleString()} · iter {tool.iteration || '—'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

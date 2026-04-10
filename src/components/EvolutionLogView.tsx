import React, { useEffect, useMemo, useState } from 'react';
import { getRuntimeState } from '../lib/runtimeData';

export function EvolutionLogView() {
  const [filter, setFilter] = useState<string>('all');
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const onUpdate = () => setVersion(v => v + 1);
    window.addEventListener('silicon:data-updated', onUpdate);
    return () => window.removeEventListener('silicon:data-updated', onUpdate);
  }, []);

  const state = useMemo(() => getRuntimeState(), [version]);
  const filtered = filter === 'all' ? state.evolution : state.evolution.filter(e => e.type === filter);
  const latestRun = [...state.runs].reverse()[0];

  return (
    <div className="scroll-area" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
      <div className="card" style={{ padding: '14px 20px', marginBottom: 24, display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 24 }}>
          <div><div style={{ fontSize: 10, color: 'var(--ink-muted)' }}>Active Hypothesis</div><div style={{ fontWeight: 600 }}>{latestRun?.problem?.slice(0, 48) || 'No active run'}</div></div>
          <div><div style={{ fontSize: 10, color: 'var(--ink-muted)' }}>Evolution Depth</div><div style={{ fontWeight: 600 }}>{state.evolution.length} events</div></div>
          <div><div style={{ fontSize: 10, color: 'var(--ink-muted)' }}>Tool Calls</div><div style={{ fontWeight: 600 }}>{state.toolCalls.length} executed</div></div>
        </div>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ margin: 0 }}>Self-Correction Path</h2>
          <div style={{ display: 'flex', gap: 4 }}>{['all', 'hypothesis', 'correction', 'failure', 'success'].map(f => <button key={f} className={`tab-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>)}</div>
        </div>
        {filtered.length === 0 && <div style={{ color: 'var(--ink-muted)' }}>No runtime evolution data yet. Start an experiment in Workspace.</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...filtered].reverse().map((entry, i) => (
            <div key={`${entry.at}-${i}`} style={{ padding: '12px 14px', border: '1px solid var(--rule)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><strong>{entry.title}</strong><span style={{ fontSize: 11 }}>{new Date(entry.at).toLocaleString()}</span></div>
              <p style={{ margin: 0 }}>{entry.content}</p>
              {typeof entry.confidence === 'number' && <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)' }}>Confidence: {(entry.confidence * 100).toFixed(0)}%</div>}
              {entry.tools && entry.tools.length > 0 && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--ink-muted)' }}>{entry.tools.length} related tool calls</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

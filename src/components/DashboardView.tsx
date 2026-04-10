import React, { useEffect, useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { getRuntimeState } from '../lib/runtimeData';

interface DashboardViewProps {
  onNewExperiment: () => void;
  onNavigate: (tab: string) => void;
}

const statusTagClass = (s: string) => {
  if (s === 'completed') return 'green';
  if (s === 'running') return 'gold';
  if (s === 'failed') return 'red';
  return 'muted';
};

export function DashboardView({ onNewExperiment, onNavigate }: DashboardViewProps) {
  const [now, setNow] = useState(new Date());
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onUpdate = () => setVersion(v => v + 1);
    window.addEventListener('silicon:data-updated', onUpdate);
    return () => window.removeEventListener('silicon:data-updated', onUpdate);
  }, []);

  const state = useMemo(() => getRuntimeState(), [version]);

  const trendData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dayKey = d.toISOString().slice(0, 10);
      const runs = state.runs.filter(r => r.startedAt.slice(0, 10) === dayKey);
      return {
        day: days[d.getDay()],
        experiments: runs.length,
        success: runs.filter(r => r.status === 'completed').length,
      };
    });
    return data;
  }, [state.runs]);

  const convergenceData = useMemo(() =>
    state.telemetry.slice(-20).map((p, idx) => ({
      iter: idx + 1,
      loss: Math.max(0, 1 - (p.confidence || 0)),
      confidence: p.confidence || 0,
    })), [state.telemetry]);

  const recentRuns = [...state.runs].slice(-5).reverse();
  const completed = state.runs.filter(r => r.status === 'completed').length;
  const running = state.runs.filter(r => r.status === 'running').length;
  const avgConfidence = state.runs.length
    ? state.runs.reduce((acc, r) => acc + (r.finalConfidence || 0), 0) / state.runs.length
    : 0;

  return (
    <div className="scroll-area" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.03em' }}>Research Dashboard</h1>
          <p style={{ fontSize: 14, color: 'var(--ink-muted)', margin: 0 }}>
            {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · Live runtime analytics
          </p>
        </div>
        <button className="btn-primary accent" onClick={onNewExperiment}><span style={{ fontSize: 15 }}>+</span> New Experiment</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Experiments', value: `${state.runs.length}`, sub: 'all recorded runs', color: 'var(--ink)' },
          { label: 'Success Rate', value: `${state.runs.length ? ((completed / state.runs.length) * 100).toFixed(1) : '0.0'}%`, sub: `${completed} completed`, color: 'var(--accent-sage)' },
          { label: 'Active Now', value: `${running}`, sub: running ? 'in progress' : 'idle', color: 'var(--accent-warm)' },
          { label: 'Avg Confidence', value: avgConfidence.toFixed(2), sub: 'across completed runs', color: 'var(--accent-slate)' },
          { label: 'Tool Calls', value: `${state.toolCalls.length}`, sub: 'streamed from runs', color: 'var(--accent-gold)' },
        ].map((m, i) => (
          <div key={i} className="metric-card">
            <div style={{ fontSize: 10.5, color: 'var(--ink-muted)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>{m.label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: m.color, lineHeight: 1, marginBottom: 4 }}>{m.value}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 24 }}>
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, margin: '0 0 10px' }}>Weekly Activity</h3>
          <div style={{ height: 200 }}><ResponsiveContainer width="100%" height="100%"><BarChart data={trendData}><CartesianGrid strokeDasharray="2 2" stroke="var(--rule-light)" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Bar dataKey="experiments" fill="var(--accent)" opacity={0.25} /><Bar dataKey="success" fill="var(--accent)" /></BarChart></ResponsiveContainer></div>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, margin: '0 0 10px' }}>Convergence Trend</h3>
          <div style={{ height: 200 }}><ResponsiveContainer width="100%" height="100%"><AreaChart data={convergenceData}><CartesianGrid strokeDasharray="2 2" stroke="var(--rule-light)" /><XAxis dataKey="iter" /><YAxis /><Tooltip /><Area type="monotone" dataKey="confidence" stroke="#3a6b5a" /><Area type="monotone" dataKey="loss" stroke="#c0392b" /></AreaChart></ResponsiveContainer></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 18 }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--rule)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, margin: 0 }}>Recent Experiments</h3>
            <button className="btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => onNavigate('evolution-log')}>View All →</button>
          </div>
          <table className="data-table"><thead><tr><th>ID</th><th>Experiment</th><th>Status</th><th>Confidence</th><th>Iterations</th></tr></thead>
            <tbody>{recentRuns.map(exp => (
              <tr key={exp.id} onClick={() => onNavigate('workspace')} style={{ cursor: 'pointer' }}>
                <td className="mono-cell" style={{ fontWeight: 600 }}>{exp.id}</td>
                <td style={{ fontWeight: 500 }}>{exp.problem.slice(0, 52)}</td>
                <td><span className={`tag ${statusTagClass(exp.status)}`}>{exp.status}</span></td>
                <td className="mono-cell">{exp.finalConfidence ? `${(exp.finalConfidence * 100).toFixed(0)}%` : '—'}</td>
                <td className="mono-cell">{exp.currentIteration}/{exp.maxIterations}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--rule)' }}><h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, margin: 0 }}>Activity Feed</h3></div>
          <div className="scroll-area" style={{ flex: 1, padding: '12px 16px', overflowY: 'auto', maxHeight: 320 }}>
            {[...state.activity].slice(-12).reverse().map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 14 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', marginTop: 5 }} />
                <div><p style={{ fontSize: 12.5, margin: 0 }}>{a.msg}</p><span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{new Date(a.at).toLocaleString()}</span></div></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

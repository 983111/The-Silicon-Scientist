import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';

const trendData = [
  { day: 'Mon', experiments: 3, success: 2 },
  { day: 'Tue', experiments: 5, success: 4 },
  { day: 'Wed', experiments: 2, success: 1 },
  { day: 'Thu', experiments: 7, success: 6 },
  { day: 'Fri', experiments: 4, success: 3 },
  { day: 'Sat', experiments: 6, success: 5 },
  { day: 'Sun', experiments: 8, success: 7 },
];

const convergenceData = Array.from({ length: 20 }, (_, i) => ({
  iter: i + 1,
  loss: Math.max(0.01, 1.2 * Math.exp(-0.18 * i) + (Math.random() - 0.5) * 0.05),
  confidence: Math.min(0.99, 0.1 + 0.045 * i + (Math.random() - 0.5) * 0.03),
}));

interface DashboardViewProps {
  onNewExperiment: () => void;
}

const RECENT_EXPERIMENTS = [
  { id: 'EXP-0042', name: 'Graphene-NbSe₂ Superlattice', status: 'completed', confidence: 0.94, iterations: 14, time: '14h 22m' },
  { id: 'EXP-0041', name: 'CO₂ Reduction Catalyst', status: 'completed', confidence: 0.87, iterations: 8, time: '6h 45m' },
  { id: 'EXP-0040', name: 'Protein Folding — SARS-CoV-2', status: 'failed', confidence: 0.32, iterations: 20, time: '18h 10m' },
  { id: 'EXP-0039', name: 'Li-ion Cathode Optimization', status: 'completed', confidence: 0.91, iterations: 11, time: '9h 30m' },
  { id: 'EXP-0038', name: 'Perovskite Solar Cell Stability', status: 'running', confidence: 0.68, iterations: 6, time: '4h 12m' },
];

const ACTIVITY = [
  { time: '2m ago', msg: 'Hypothesis self-corrected in EXP-0042: adjusted lattice constant', type: 'correction' },
  { time: '18m ago', msg: 'DFT calculation completed for NbSe₂ orbital overlap', type: 'tool' },
  { time: '34m ago', msg: 'New experiment EXP-0042 started autonomously', type: 'start' },
  { time: '1h ago', msg: 'EXP-0041 concluded with 87% confidence', type: 'complete' },
  { time: '2h ago', msg: 'Convergence anomaly detected in EXP-0040 iteration 15', type: 'anomaly' },
  { time: '3h ago', msg: 'Script monte_carlo_v2.py optimized — 12% faster', type: 'tool' },
];

export function DashboardView({ onNewExperiment }: DashboardViewProps) {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);

  const statusColor = (s: string) => {
    if (s === 'completed') return 'green';
    if (s === 'running') return 'gold';
    return 'red';
  };

  return (
    <div className="scroll-area" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
      {/* Top Hero Row */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.03em' }}>
            Research Dashboard
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-muted)', margin: 0 }}>
            {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · Autonomous Lab Agent
          </p>
        </div>
        <button className="btn-primary accent" onClick={onNewExperiment}>
          <span style={{ fontSize: 15 }}>+</span> New Experiment
        </button>
      </div>

      {/* Metrics Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Experiments', value: '42', sub: '+3 this week', color: 'var(--ink)' },
          { label: 'Success Rate', value: '78.6%', sub: '33 of 42', color: 'var(--accent-sage)' },
          { label: 'Active Now', value: '1', sub: 'EXP-0038', color: 'var(--accent-warm)' },
          { label: 'Avg Confidence', value: '0.84', sub: 'across all runs', color: 'var(--accent-slate)' },
          { label: 'Tool Calls (K2)', value: '1,247', sub: 'DFT, MD, QM', color: 'var(--accent-gold)' },
        ].map((m, i) => (
          <div key={i} className="metric-card">
            <div style={{ fontSize: 10.5, color: 'var(--ink-muted)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
              {m.label}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: m.color, lineHeight: 1, marginBottom: 4, letterSpacing: '-0.02em' }}>
              {m.value}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 24 }}>
        {/* Weekly Experiments */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, margin: 0 }}>Weekly Activity</h3>
              <p style={{ fontSize: 12, color: 'var(--ink-muted)', margin: '2px 0 0' }}>Experiments launched & succeeded</p>
            </div>
          </div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="var(--rule-light)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#7a7870', fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#7a7870', fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 8, fontSize: 12, fontFamily: 'DM Mono' }} />
                <Bar dataKey="experiments" fill="var(--accent)" radius={[4, 4, 0, 0]} opacity={0.25} />
                <Bar dataKey="success" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Convergence Curve */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, margin: 0 }}>Convergence Trend</h3>
              <p style={{ fontSize: 12, color: 'var(--ink-muted)', margin: '2px 0 0' }}>Loss & confidence across iterations</p>
            </div>
          </div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={convergenceData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3a6b5a" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3a6b5a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c0392b" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#c0392b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="var(--rule-light)" />
                <XAxis dataKey="iter" tick={{ fontSize: 10, fill: '#7a7870', fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#7a7870', fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 8, fontSize: 12, fontFamily: 'DM Mono' }} />
                <Area type="monotone" dataKey="confidence" stroke="#3a6b5a" strokeWidth={2} fill="url(#confGrad)" />
                <Area type="monotone" dataKey="loss" stroke="#c0392b" strokeWidth={1.5} fill="url(#lossGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Experiments + Activity Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 18 }}>
        {/* Recent Experiments */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--rule)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, margin: 0 }}>Recent Experiments</h3>
            <button className="btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }}>View All →</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Experiment</th>
                  <th>Status</th>
                  <th>Confidence</th>
                  <th>Iterations</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_EXPERIMENTS.map((exp, i) => (
                  <tr key={i} style={{ cursor: 'pointer' }}>
                    <td className="mono-cell" style={{ fontWeight: 600 }}>{exp.id}</td>
                    <td style={{ fontWeight: 500, color: 'var(--ink)' }}>{exp.name}</td>
                    <td><span className={`tag ${statusColor(exp.status)}`}>{exp.status}</span></td>
                    <td className="mono-cell" style={{ color: exp.confidence > 0.8 ? 'var(--accent-sage)' : exp.confidence > 0.5 ? 'var(--accent-gold)' : 'var(--accent)' }}>
                      {(exp.confidence * 100).toFixed(0)}%
                    </td>
                    <td className="mono-cell">{exp.iterations}</td>
                    <td className="mono-cell">{exp.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--rule)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, margin: 0 }}>Activity Feed</h3>
          </div>
          <div className="scroll-area" style={{ flex: 1, padding: '12px 16px', overflowY: 'auto', maxHeight: 320 }}>
            {ACTIVITY.map((a, i) => {
              const dot = a.type === 'correction' ? 'var(--accent-warm)'
                : a.type === 'complete' ? 'var(--accent-sage)'
                : a.type === 'anomaly' ? 'var(--accent)'
                : a.type === 'start' ? 'var(--accent-slate)'
                : 'var(--accent-gold)';
              return (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: dot, flexShrink: 0, marginTop: 5 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12.5, color: 'var(--ink-mid)', margin: 0, lineHeight: 1.5 }}>{a.msg}</p>
                    <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{a.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

// ── Performance Matrix: comparative evaluation of experiment outcomes

const EXPERIMENTS = [
  { id: 'EXP-0042', name: 'Graphene-NbSe₂', stability: 94, energy: 82, convergence: 97, speed: 65, accuracy: 91, cost: 78 },
  { id: 'EXP-0041', name: 'CO₂ Catalyst', stability: 87, energy: 71, convergence: 85, speed: 88, accuracy: 83, cost: 92 },
  { id: 'EXP-0040', name: 'Protein Fold', stability: 32, energy: 45, convergence: 28, speed: 42, accuracy: 38, cost: 55 },
  { id: 'EXP-0039', name: 'Li-ion Cathode', stability: 91, energy: 88, convergence: 89, speed: 72, accuracy: 86, cost: 81 },
  { id: 'EXP-0038', name: 'Perovskite Solar', stability: 68, energy: 74, convergence: 62, speed: 80, accuracy: 71, cost: 88 },
];

const PARAMS = ['stability', 'energy', 'convergence', 'speed', 'accuracy', 'cost'] as const;

const comparisonData = PARAMS.map(param => {
  const item: any = { param: param.charAt(0).toUpperCase() + param.slice(1) };
  EXPERIMENTS.forEach(exp => { item[exp.id] = (exp as any)[param]; });
  return item;
});

const radarData = PARAMS.map(param => ({
  subject: param.charAt(0).toUpperCase() + param.slice(1),
  A: EXPERIMENTS[0][param],
  B: EXPERIMENTS[1][param],
  fullMark: 100,
}));

const COLORS = ['var(--accent)', 'var(--accent-slate)', 'var(--accent-sage)', 'var(--accent-gold)', 'var(--accent-warm)'];

export function PerformanceView() {
  const [selectedExps, setSelectedExps] = useState<string[]>([EXPERIMENTS[0].id, EXPERIMENTS[1].id]);
  const [sortBy, setSortBy] = useState<typeof PARAMS[number]>('stability');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const toggleExp = (id: string) => {
    setSelectedExps(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  const sorted = [...EXPERIMENTS].sort((a, b) => {
    const diff = (a as any)[sortBy] - (b as any)[sortBy];
    return sortDir === 'desc' ? -diff : diff;
  });

  const handleSort = (param: typeof PARAMS[number]) => {
    if (sortBy === param) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortBy(param); setSortDir('desc'); }
  };

  return (
    <div className="scroll-area" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.03em' }}>
          Performance Matrix
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)', margin: 0 }}>
          Comparative evaluation of experiment outcomes across multiple parameters
        </p>
      </div>

      {/* Experiment selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-muted)', alignSelf: 'center', marginRight: 4 }}>Compare:</span>
        {EXPERIMENTS.map((exp, i) => (
          <button
            key={exp.id}
            onClick={() => toggleExp(exp.id)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border: `1.5px solid ${selectedExps.includes(exp.id) ? COLORS[i] : 'var(--rule)'}`,
              background: selectedExps.includes(exp.id) ? `${COLORS[i]}12` : 'var(--white)',
              color: selectedExps.includes(exp.id) ? COLORS[i] : 'var(--ink-muted)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, marginRight: 6 }}>{exp.id}</span>
            {exp.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 20 }}>
        {/* Bar Chart Comparison */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, margin: '0 0 16px' }}>Parameter Comparison</h3>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="var(--rule-light)" />
                <XAxis dataKey="param" tick={{ fontSize: 10, fill: '#7a7870' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#7a7870', fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 8, fontSize: 12, fontFamily: 'DM Mono' }} />
                {EXPERIMENTS.filter(e => selectedExps.includes(e.id)).map((exp, i) => (
                  <Bar key={exp.id} dataKey={exp.id} fill={COLORS[EXPERIMENTS.indexOf(exp)]} radius={[3, 3, 0, 0]} opacity={0.8} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, margin: '0 0 16px' }}>Multi-Axis Comparison</h3>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="var(--rule-light)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#7a7870' }} />
                <PolarRadiusAxis tick={{ fontSize: 9, fill: '#7a7870' }} domain={[0, 100]} />
                <Radar name={EXPERIMENTS[0].name} dataKey="A" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.15} strokeWidth={2} />
                <Radar name={EXPERIMENTS[1].name} dataKey="B" stroke="var(--accent-slate)" fill="var(--accent-slate)" fillOpacity={0.1} strokeWidth={2} />
                <Tooltip contentStyle={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 8, fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Performance Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--rule)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, margin: 0 }}>Detailed Performance Table</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Experiment</th>
                {PARAMS.map(p => (
                  <th key={p} onClick={() => handleSort(p)} style={{ cursor: 'pointer', userSelect: 'none' }}>
                    {p.charAt(0).toUpperCase() + p.slice(1)} {sortBy === p ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                  </th>
                ))}
                <th>Avg Score</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((exp, i) => {
                const avg = PARAMS.reduce((sum, p) => sum + exp[p], 0) / PARAMS.length;
                return (
                  <tr key={exp.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{exp.name}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-muted)' }}>{exp.id}</div>
                    </td>
                    {PARAMS.map(p => (
                      <td key={p}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-bar" style={{ width: 60, height: 3 }}>
                            <div className="progress-fill" style={{
                              width: `${exp[p]}%`,
                              background: exp[p] > 80 ? 'var(--accent-sage)' : exp[p] > 50 ? 'var(--accent-gold)' : 'var(--accent)',
                            }} />
                          </div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: exp[p] > 80 ? 'var(--accent-sage)' : exp[p] > 50 ? 'var(--accent-gold)' : 'var(--accent)', minWidth: 28 }}>
                            {exp[p]}
                          </span>
                        </div>
                      </td>
                    ))}
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: avg > 80 ? 'var(--accent-sage)' : avg > 50 ? 'var(--accent-gold)' : 'var(--accent)' }}>
                        {avg.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

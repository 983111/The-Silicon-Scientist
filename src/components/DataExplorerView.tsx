import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ScatterChart, Scatter, ZAxis,
} from 'recharts';

// ── Data Explorer: interactive visualization suite

const trendData = [
  { iter: 1, stability: 0.30, energy: 15.2 }, { iter: 2, stability: 0.45, energy: 14.8 },
  { iter: 3, stability: 0.38, energy: 14.9 }, { iter: 4, stability: 0.61, energy: 13.5 },
  { iter: 5, stability: 0.58, energy: 13.8 }, { iter: 6, stability: 0.79, energy: 12.1 },
  { iter: 7, stability: 0.94, energy: 11.5 }, { iter: 8, stability: 0.91, energy: 11.8 },
  { iter: 9, stability: 0.97, energy: 11.2 }, { iter: 10, stability: 0.99, energy: 11.0 },
];

const scatterData = Array.from({ length: 60 }, (_, i) => ({
  x: +(Math.random() * 100).toFixed(1),
  y: +(Math.random() * 100).toFixed(1),
  z: Math.floor(Math.random() * 200 + 20),
}));

const TABLE_DATA = [
  { time: '12:04:22.001', id: 'ATOM_L_042', vel: '1.442e-9', ori: '[0.12, 0.44, 1.0]', status: 'STABLE', statusCls: 'green' as const },
  { time: '12:04:22.048', id: 'ATOM_L_043', vel: '1.448e-9', ori: '[0.12, 0.45, 0.9]', status: 'STABLE', statusCls: 'green' as const },
  { time: '12:04:22.112', id: 'SULF_S_011', vel: '0.221e-9', ori: '[0.88, 0.12, 0.2]', status: 'BONDING', statusCls: 'blue' as const },
  { time: '12:04:22.350', id: 'ION_P_992', vel: '8.122e-9', ori: '[0.00, 0.00, 0.1]', status: 'REJECTED', statusCls: 'red' as const },
  { time: '12:04:22.601', id: 'ATOM_L_044', vel: '1.449e-9', ori: '[0.13, 0.46, 1.0]', status: 'STABLE', statusCls: 'green' as const },
  { time: '12:04:22.803', id: 'BOND_C_007', vel: '0.098e-9', ori: '[0.50, 0.50, 0.5]', status: 'BONDING', statusCls: 'blue' as const },
];

const SCRIPTS = [
  { name: 'monte_carlo_v2.py', desc: 'Iterative sampling for cathode porosity', active: true },
  { name: 'thermal_stress.py', desc: 'Gradient analysis at 4C discharge' },
  { name: 'viscosity_calc.py', desc: 'Fluid dynamics of electrolyte flow' },
  { name: 'lattice_opt.py', desc: 'Geometry optimization for crystalline stability' },
  { name: 'ion_path_trace.py', desc: 'Ionic trajectory computation' },
];

function downloadCSV() {
  const header = 'Timestamp,Entity ID,Velocity (m/s),Orientation,Status\n';
  const rows = TABLE_DATA.map(r => `${r.time},${r.id},${r.vel},"${r.ori}",${r.status}`).join('\n');
  const blob = new Blob([header + rows], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'telemetry_export.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export function DataExplorerView() {
  const [chartView, setChartView] = useState<'stability' | 'energy'>('stability');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredTable = filterStatus === 'all' ? TABLE_DATA : TABLE_DATA.filter(r => r.status.toLowerCase() === filterStatus);

  return (
    <div className="scroll-area" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.03em' }}>
            Data Explorer
          </h1>
          <p style={{ fontSize: 13, color: 'var(--ink-muted)', margin: 0 }}>
            Interactive visualization suite with filtering and export
          </p>
        </div>
      </div>

      {/* Top metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Correlation (r)', value: '0.842', sub: 'density vs pressure', color: 'var(--accent)' },
          { label: 'P-Value', value: '< 0.001', sub: 'statistically significant', color: 'var(--accent-sage)' },
          { label: 'Data Points', value: '60 / 60', sub: 'complete dataset', color: 'var(--ink)' },
        ].map((m, i) => (
          <div key={i} className="metric-card">
            <div style={{ fontSize: 10.5, color: 'var(--ink-muted)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>{m.label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: m.color, lineHeight: 1, marginBottom: 4 }}>{m.value}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Main charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18, marginBottom: 20 }}>
        {/* Scatter */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>Raw Data Distribution</h3>
              <p style={{ fontSize: 12, color: 'var(--ink-muted)', margin: '3px 0 0' }}>Density vs Pressure scatter plot</p>
            </div>
            <button className="btn-ghost" style={{ fontSize: 12, padding: '5px 10px' }} onClick={downloadCSV}>↓ Export CSV</button>
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -15 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="var(--rule-light)" />
                <XAxis type="number" dataKey="x" name="Density" tick={{ fontSize: 11, fill: '#7a7870', fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                <YAxis type="number" dataKey="y" name="Pressure" tick={{ fontSize: 11, fill: '#7a7870', fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                <ZAxis type="number" dataKey="z" range={[20, 150]} name="Volume" />
                <Tooltip contentStyle={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 8, fontSize: 12, fontFamily: 'DM Mono' }} />
                <Scatter name="Simulation Data" data={scatterData} fill="var(--accent)" fillOpacity={0.55} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right column: charts + scripts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Performance matrix */}
          <div className="card" style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Performance</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {(['stability', 'energy'] as const).map(v => (
                  <button key={v} className={`tab-btn ${chartView === v ? 'active' : ''}`} onClick={() => setChartView(v)} style={{ padding: '3px 8px', fontSize: 11 }}>
                    {v === 'stability' ? 'Stability' : 'Energy'}
                  </button>
                ))}
              </div>
            </div>
            {/* Bar rows */}
            {[
              { label: 'LFP Chem-A', value: '94.2%', pct: 94, color: 'var(--accent-sage)' },
              { label: 'NMC Chem-D', value: '88.7%', pct: 88, color: 'var(--accent-slate)' },
              { label: 'SolidState Gen-1', value: '42.1%', pct: 42, color: 'var(--accent-gold)' },
            ].map((m, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--ink-mid)' }}>{m.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: m.color, fontFamily: 'var(--font-mono)' }}>{m.value}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${m.pct}%`, background: m.color }} />
                </div>
              </div>
            ))}

            {/* Mini area chart */}
            <div style={{ marginTop: 12, height: 80 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 5, right: 0, left: -30, bottom: 0 }}>
                  <defs>
                    <linearGradient id="deGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c0392b" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#c0392b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 2" stroke="var(--rule-light)" />
                  <XAxis dataKey="iter" tick={{ fontSize: 9, fill: '#7a7870', fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#7a7870', fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 6, fontSize: 11 }} />
                  <Area type="monotone" dataKey={chartView === 'stability' ? 'stability' : 'energy'} stroke="#c0392b" strokeWidth={1.5} fill="url(#deGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Script repo */}
          <div className="card" style={{ padding: '14px 16px', flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              Script Repository
            </div>
            {SCRIPTS.map((s, i) => (
              <div key={i} style={{
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${s.active ? 'var(--accent)' : 'transparent'}`,
                background: s.active ? 'var(--accent-light)' : 'transparent',
                marginBottom: 4,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: s.active ? 'var(--accent)' : 'var(--ink)', fontWeight: s.active ? 600 : 400, marginBottom: 2 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Telemetry table with filter */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--rule)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
            Raw Simulation Telemetry
          </h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {['all', 'stable', 'bonding', 'rejected'].map(f => (
                <button key={f} className={`tab-btn ${filterStatus === f ? 'active' : ''}`} onClick={() => setFilterStatus(f)} style={{ fontSize: 11, padding: '3px 8px', textTransform: 'capitalize' }}>
                  {f}
                </button>
              ))}
            </div>
            <button className="btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }} onClick={downloadCSV}>↓ Export CSV</button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Entity ID</th>
                <th>Velocity (m/s)</th>
                <th>Orientation</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTable.map((row, i) => (
                <tr key={i}>
                  <td className="mono-cell">{row.time}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 600, color: 'var(--ink)' }}>{row.id}</td>
                  <td className="mono-cell">{row.vel}</td>
                  <td className="mono-cell" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.ori}</td>
                  <td><span className={`tag ${row.statusCls}`}>{row.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

// ── Telemetry & Metrics Engine: live experimental signals

function generateTimeSeries(length: number, base: number, variance: number, trend: number = 0) {
  return Array.from({ length }, (_, i) => ({
    t: i,
    value: +(base + trend * i + (Math.random() - 0.5) * variance).toFixed(2),
  }));
}

const TEMP_DATA = generateTimeSeries(40, 72, 8, 0.1);
const LOAD_DATA = generateTimeSeries(40, 45, 15, 0.3);
const CONVERGENCE_DATA = generateTimeSeries(40, 0.08, 0.03, -0.0015);
const MEMORY_DATA = generateTimeSeries(40, 62, 5, 0.15);

interface GaugeProps {
  value: number;
  max: number;
  label: string;
  unit: string;
  color: string;
}

function Gauge({ value, max, label, unit, color }: GaugeProps) {
  const pct = Math.min((value / max) * 100, 100);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference * 0.75; // 270° arc

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width="88" height="88" viewBox="0 0 88 88">
        {/* Background arc */}
        <circle cx="44" cy="44" r={radius} fill="none" stroke="var(--rule-light)" strokeWidth="5"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          strokeLinecap="round" transform="rotate(135 44 44)" />
        {/* Value arc */}
        <circle cx="44" cy="44" r={radius} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${(pct / 100) * circumference * 0.75} ${circumference}`}
          strokeLinecap="round" transform="rotate(135 44 44)"
          style={{ transition: 'stroke-dasharray 0.5s ease' }} />
        <text x="44" y="40" textAnchor="middle" fontSize="16" fontFamily="DM Mono" fontWeight="600" fill="var(--ink)">
          {value}
        </text>
        <text x="44" y="54" textAnchor="middle" fontSize="9" fontFamily="DM Mono" fill="var(--ink-muted)">
          {unit}
        </text>
      </svg>
      <div style={{ fontSize: 10.5, color: 'var(--ink-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{label}</div>
    </div>
  );
}

const CORRELATION_MATRIX = [
  { a: 'Temperature', b: 'Convergence', r: -0.73, sig: '< 0.001' },
  { a: 'Compute Load', b: 'Temperature', r: 0.82, sig: '< 0.001' },
  { a: 'Memory Usage', b: 'Compute Load', r: 0.91, sig: '< 0.0001' },
  { a: 'Convergence', b: 'Iterations', r: -0.88, sig: '< 0.001' },
  { a: 'Temperature', b: 'Memory Usage', r: 0.65, sig: '< 0.01' },
];

export function TelemetryView() {
  const [liveTemp, setLiveTemp] = useState(72);
  const [liveLoad, setLiveLoad] = useState(45);
  const [liveConv, setLiveConv] = useState(0.08);
  const [liveMem, setLiveMem] = useState(62);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTemp(prev => +(prev + (Math.random() - 0.48) * 3).toFixed(1));
      setLiveLoad(prev => Math.min(100, Math.max(10, +(prev + (Math.random() - 0.45) * 5).toFixed(1))));
      setLiveConv(prev => Math.max(0.001, +(prev + (Math.random() - 0.55) * 0.005).toFixed(4)));
      setLiveMem(prev => Math.min(100, Math.max(20, +(prev + (Math.random() - 0.45) * 2).toFixed(1))));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="scroll-area" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.03em' }}>
          Telemetry & Metrics Engine
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)', margin: 0 }}>
          Live experimental signals — kernel temperature, compute load, convergence delta, correlations
        </p>
      </div>

      {/* Gauges Row */}
      <div className="card" style={{ padding: '24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
          <Gauge value={liveTemp} max={120} label="Kernel Temp" unit="°C" color="var(--accent-warm)" />
          <div style={{ width: 1, height: 60, background: 'var(--rule-light)' }} />
          <Gauge value={liveLoad} max={100} label="Compute Load" unit="%" color="var(--accent-slate)" />
          <div style={{ width: 1, height: 60, background: 'var(--rule-light)' }} />
          <Gauge value={liveConv} max={0.2} label="Conv. Delta" unit="Δ" color="var(--accent-sage)" />
          <div style={{ width: 1, height: 60, background: 'var(--rule-light)' }} />
          <Gauge value={liveMem} max={100} label="Memory" unit="%" color="var(--accent-gold)" />
          <div style={{ width: 1, height: 60, background: 'var(--rule-light)' }} />
          <Gauge value={14} max={20} label="Iterations" unit="done" color="var(--accent)" />
        </div>
      </div>

      {/* Time Series Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {[
          { title: 'Kernel Temperature', data: TEMP_DATA, color: '#d4512a', unit: '°C' },
          { title: 'Compute Load', data: LOAD_DATA, color: '#2d4a6e', unit: '%' },
          { title: 'Convergence Delta', data: CONVERGENCE_DATA, color: '#3a6b5a', unit: 'Δ' },
          { title: 'Memory Usage', data: MEMORY_DATA, color: '#b8922a', unit: '%' },
        ].map((chart, i) => (
          <div key={i} className="card" style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-mid)' }}>{chart.title}</div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: chart.color, fontWeight: 600 }}>
                {chart.data[chart.data.length - 1].value} {chart.unit}
              </span>
            </div>
            <div style={{ height: 120 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart.data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chart.color} stopOpacity={0.12} />
                      <stop offset="95%" stopColor={chart.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 2" stroke="var(--rule-light)" />
                  <XAxis dataKey="t" tick={{ fontSize: 9, fill: '#7a7870', fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#7a7870', fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 6, fontSize: 11, fontFamily: 'DM Mono' }} />
                  <Area type="monotone" dataKey="value" stroke={chart.color} strokeWidth={1.5} fill={`url(#grad-${i})`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* Correlation Matrix */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--rule)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, margin: 0 }}>
            Correlation Matrix & Statistical Significance
          </h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Variable A</th>
              <th>Variable B</th>
              <th>Pearson r</th>
              <th>P-Value</th>
              <th>Significance</th>
            </tr>
          </thead>
          <tbody>
            {CORRELATION_MATRIX.map((row, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500, color: 'var(--ink)' }}>{row.a}</td>
                <td style={{ fontWeight: 500, color: 'var(--ink)' }}>{row.b}</td>
                <td>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
                    color: Math.abs(row.r) > 0.8 ? 'var(--accent-sage)' : Math.abs(row.r) > 0.6 ? 'var(--accent-gold)' : 'var(--ink-muted)',
                  }}>
                    {row.r > 0 ? '+' : ''}{row.r.toFixed(2)}
                  </span>
                </td>
                <td className="mono-cell">{row.sig}</td>
                <td>
                  <span className={`tag ${Math.abs(row.r) > 0.8 ? 'green' : Math.abs(row.r) > 0.6 ? 'gold' : 'muted'}`}>
                    {Math.abs(row.r) > 0.8 ? 'STRONG' : Math.abs(row.r) > 0.6 ? 'MODERATE' : 'WEAK'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

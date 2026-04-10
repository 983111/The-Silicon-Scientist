import React, { useEffect, useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getRuntimeState } from '../lib/runtimeData';

export function TelemetryView() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const onUpdate = () => setVersion(v => v + 1);
    window.addEventListener('silicon:data-updated', onUpdate);
    return () => window.removeEventListener('silicon:data-updated', onUpdate);
  }, []);

  const telemetry = useMemo(() => getRuntimeState().telemetry.slice(-50).map((p, i) => ({
    t: i + 1,
    confidence: +(p.confidence || 0).toFixed(3),
    successRate: +(p.successRate || 0).toFixed(2),
  })), [version]);

  const latest = telemetry[telemetry.length - 1];

  return (
    <div className="scroll-area" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
      <h1 style={{ margin: '0 0 4px' }}>Telemetry & Metrics Engine</h1>
      <p style={{ margin: '0 0 20px', color: 'var(--ink-muted)' }}>Live metrics from experiment execution phases.</p>

      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 24 }}>
          <div>Samples: <strong>{telemetry.length}</strong></div>
          <div>Latest confidence: <strong>{latest ? `${(latest.confidence * 100).toFixed(0)}%` : '—'}</strong></div>
          <div>Latest success rate: <strong>{latest ? `${latest.successRate.toFixed(1)}%` : '—'}</strong></div>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={telemetry}>
              <CartesianGrid strokeDasharray="2 2" stroke="var(--rule-light)" />
              <XAxis dataKey="t" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="confidence" stroke="#3a6b5a" fill="#3a6b5a33" />
              <Area type="monotone" dataKey="successRate" stroke="#2d4a6e" fill="#2d4a6e33" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

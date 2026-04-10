import React, { useState, useEffect, useRef } from 'react';

// ── Tool Execution Stream: real-time logs of external scientific tools

interface ToolLog {
  id: string;
  time: string;
  name: string;
  description: string;
  status: 'running' | 'ok' | 'error' | 'queued';
  duration?: string;
  output?: string;
  category: string;
}

const MOCK_TOOLS: ToolLog[] = [
  { id: 'T001', time: '14:22:10', name: 'CRYSTAL_LATTICE_GEN', description: 'Generating lattice structure for hBN/Graphene/NbSe₂ superlattice with twist angle 1.08°', status: 'ok', duration: '12.4s', output: 'Lattice: hexagonal, a=2.46Å, c=6.70Å, 42 atoms/cell', category: 'DFT' },
  { id: 'T002', time: '14:22:23', name: 'DFT_BAND_SOLVER', description: 'Computing band structure using PBE functional with spin-orbit coupling', status: 'ok', duration: '45.2s', output: 'Band gap: 0.12eV, Fermi level: -4.32eV, 128 k-points sampled', category: 'DFT' },
  { id: 'T003', time: '14:23:08', name: 'PHONON_DISPERSION', description: 'Calculating phonon dispersion along Γ-M-K-Γ path', status: 'ok', duration: '1m 23s', output: 'No imaginary frequencies detected. Max frequency: 1580 cm⁻¹', category: 'MD' },
  { id: 'T004', time: '14:24:31', name: 'THERMAL_FLUCT_MODEL', description: 'Simulating thermal fluctuations at 152K using Nosé-Hoover thermostat', status: 'error', duration: '32.1s', output: 'ERROR: Phonon scattering divergence at NbSe₂ interface layer 3', category: 'MD' },
  { id: 'T005', time: '14:25:03', name: 'SELF_CORRECT_TRIGGER', description: 'K2 initiating self-correction cycle — adjusting interlayer coupling parameters', status: 'ok', duration: '2.1s', output: 'Correction: Van der Waals radius increased by 4.2% for NbSe₂-hBN interface', category: 'AGENT' },
  { id: 'T006', time: '14:25:06', name: 'HAMILTONIAN_MATRIX_OP', description: 'Diagonalizing 2048×2048 tight-binding Hamiltonian', status: 'ok', duration: '8.7s', output: 'Eigenvalues computed. Flat band detected at -0.003eV near Fermi level', category: 'QM' },
  { id: 'T007', time: '14:25:15', name: 'MONTE_CARLO_SIM', description: 'Running 10⁶ MC steps for thermodynamic sampling at 152K', status: 'ok', duration: '2m 40s', output: 'Free energy: -14.22 eV/atom, Entropy: 0.042 eV/K, Phase: stable', category: 'SIM' },
  { id: 'T008', time: '14:27:55', name: 'VISCOSITY_CALC', description: 'Computing electrolyte viscosity using Green-Kubo formalism', status: 'ok', duration: '18.3s', output: 'η = 8.92 × 10⁻⁴ Pa·s at 298K', category: 'MD' },
  { id: 'T009', time: '14:28:14', name: 'ION_PATH_TRACE', description: 'Tracing ionic diffusion pathways through lattice channels', status: 'running', duration: '—', category: 'SIM' },
  { id: 'T010', time: '14:28:14', name: 'ELIASHBERG_SOLVER', description: 'Solving Eliashberg equations for superconducting Tc prediction', status: 'queued', category: 'QM' },
];

const CATEGORIES = ['ALL', 'DFT', 'MD', 'QM', 'SIM', 'AGENT'];

export function ToolStreamView() {
  const [tools] = useState<ToolLog[]>(MOCK_TOOLS);
  const [filterCat, setFilterCat] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const filtered = tools.filter(t => {
    if (filterCat !== 'ALL' && t.category !== filterCat) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    return true;
  });

  const statusIcon = (s: string) => {
    switch (s) {
      case 'ok': return '✓';
      case 'error': return '✕';
      case 'running': return '◌';
      case 'queued': return '⋯';
      default: return '?';
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'ok': return 'var(--accent-sage)';
      case 'error': return 'var(--accent)';
      case 'running': return 'var(--accent-warm)';
      case 'queued': return 'var(--ink-muted)';
      default: return 'var(--ink-muted)';
    }
  };

  const stats = {
    total: tools.length,
    ok: tools.filter(t => t.status === 'ok').length,
    error: tools.filter(t => t.status === 'error').length,
    running: tools.filter(t => t.status === 'running').length,
  };

  return (
    <div className="scroll-area" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.03em' }}>
            Tool Execution Stream
          </h1>
          <p style={{ fontSize: 13, color: 'var(--ink-muted)', margin: 0 }}>
            Real-time logs of external scientific tool invocations
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-ghost" style={{ fontSize: 12 }}>↓ Export Log</button>
          <button className="btn-ghost" style={{ fontSize: 12 }}>⟳ Refresh</button>
        </div>
      </div>

      {/* Stats Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Calls', value: stats.total, color: 'var(--ink)' },
          { label: 'Succeeded', value: stats.ok, color: 'var(--accent-sage)' },
          { label: 'Failed', value: stats.error, color: 'var(--accent)' },
          { label: 'Running', value: stats.running, color: 'var(--accent-warm)' },
        ].map((s, i) => (
          <div key={i} className="metric-card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 10, color: 'var(--ink-muted)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 600, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--ink-muted)', fontWeight: 600, marginRight: 4 }}>Category:</span>
        {CATEGORIES.map(cat => (
          <button key={cat} className={`tab-btn ${filterCat === cat ? 'active' : ''}`} onClick={() => setFilterCat(cat)} style={{ fontSize: 11, padding: '4px 10px' }}>
            {cat}
          </button>
        ))}
        <div style={{ width: 1, height: 20, background: 'var(--rule)', margin: '0 8px' }} />
        <span style={{ fontSize: 11, color: 'var(--ink-muted)', fontWeight: 600, marginRight: 4 }}>Status:</span>
        {['all', 'ok', 'error', 'running'].map(s => (
          <button key={s} className={`tab-btn ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)} style={{ fontSize: 11, padding: '4px 10px', textTransform: 'capitalize' }}>
            {s}
          </button>
        ))}
      </div>

      {/* Tool Logs */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {filtered.map((tool, i) => (
          <div
            key={tool.id}
            style={{
              padding: '14px 20px',
              borderBottom: i < filtered.length - 1 ? '1px solid var(--rule-light)' : 'none',
              cursor: 'pointer',
              transition: 'background 0.15s',
              background: expandedId === tool.id ? 'var(--paper)' : 'transparent',
            }}
            onClick={() => setExpandedId(expandedId === tool.id ? null : tool.id)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Status icon */}
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: `${statusColor(tool.status)}18`,
                border: `1.5px solid ${statusColor(tool.status)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: statusColor(tool.status), fontWeight: 700,
                flexShrink: 0,
              }} className={tool.status === 'running' ? 'pulse' : ''}>
                {statusIcon(tool.status)}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--ink)', letterSpacing: '0.02em' }}>{tool.name}</span>
                  <span className={`tag ${tool.category === 'DFT' ? 'blue' : tool.category === 'MD' ? 'gold' : tool.category === 'QM' ? 'red' : tool.category === 'AGENT' ? 'green' : 'muted'}`}>
                    {tool.category}
                  </span>
                </div>
                <p style={{ fontSize: 12.5, color: 'var(--ink-muted)', margin: 0, lineHeight: 1.4 }} className="truncate">{tool.description}</p>
              </div>

              {/* Meta */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-muted)' }}>{tool.time}</span>
                {tool.duration && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-muted)', marginTop: 2 }}>{tool.duration}</span>}
              </div>
            </div>

            {/* Expanded output */}
            {expandedId === tool.id && tool.output && (
              <div style={{
                marginTop: 10, padding: '10px 14px',
                background: '#0F0E0D', color: '#E8E5DF',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)', fontSize: 11.5, lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}>
                <span style={{ color: 'var(--accent-sage)', fontWeight: 600 }}>→ </span>{tool.output}
              </div>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}

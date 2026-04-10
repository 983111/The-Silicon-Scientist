import React, { useState } from 'react';

// ── Evolution Log: tracks hypothesis evolution, self-correction cycles, and reasoning chains

interface EvolutionEntry {
  iteration: number;
  time: string;
  type: 'hypothesis' | 'correction' | 'success' | 'tool-cascade' | 'failure';
  title: string;
  content: string;
  correction?: string;
  tools?: { name: string; desc: string; status: string }[];
  confidence?: number;
}

const EVOLUTION_DATA: EvolutionEntry[] = [
  {
    iteration: 1, time: 'T+00:00:00', type: 'hypothesis',
    title: 'Initial Hypothesis',
    content: 'Stable superconductivity can be achieved at 140K using a purely Graphene-based bilayer structure with high twist angles.',
  },
  {
    iteration: 4, time: 'T+02:14:12', type: 'failure',
    title: 'FAILED — Simulation 4',
    content: 'Lattice collapsed at high twist angles due to insufficient interlayer adhesion energy.',
    correction: 'Incorporating Niobium Diselenide (NbSe₂) layers to stabilize the lattice structure through transition metal dichalcogenide interactions.',
  },
  {
    iteration: 5, time: 'T+03:08:44', type: 'tool-cascade',
    title: 'K2 Tool Cascade',
    content: 'Executing 222 simultaneous density functional theory (DFT) calculations across local and cloud clusters.',
    tools: [
      { name: 'CRYSTAL_LATTICE_GEN', desc: 'Refining twist angle to 1.08°', status: 'OK' },
      { name: 'DFT_BAND_SOLVER', desc: 'Mapping orbital overlaps for NbSe₂', status: 'OK' },
      { name: 'THERMAL_FLUCT_MODEL', desc: 'Divergence in phonon calculation', status: 'ERR' },
      { name: 'HAMILTONIAN_MATRIX_OP', desc: 'Solving large eigenstate problem', status: 'OK' },
    ],
  },
  {
    iteration: 8, time: 'T+05:30:00', type: 'correction',
    title: 'Hypothesis Revised',
    content: 'Twist angle reduced from 3.2° to 1.08°. NbSe₂ interlayer bonding model updated with van der Waals correction terms.',
    confidence: 0.62,
  },
  {
    iteration: 11, time: 'T+08:45:00', type: 'failure',
    title: 'FAILED — Simulation 11',
    content: 'Structural integrity lost above 110K. The NbSe₂ interface created unexpected phonon scattering.',
    correction: 'Transitioning to a Van der Waals heterostructure with hBN encapsulation to suppress thermal noise.',
  },
  {
    iteration: 14, time: 'T+14:22:10', type: 'success',
    title: 'Refinement Success v14.2',
    content: 'Phase-pure hBN/Graphene/NbSe₂ superlattice demonstrates zero resistance at 152K in simulation environment. Beginning physical validation protocols.',
    confidence: 0.94,
  },
];

const ANALYTICS = [
  { label: 'Self-Correction Accuracy', value: '94.2%', pct: 94, color: 'var(--accent)' },
  { label: 'Autonomous Exploration Gap', value: 'Low', pct: 15, color: 'var(--accent-sage)' },
  { label: 'Hypothesis Divergence', value: 'Moderate', pct: 45, color: 'var(--accent-gold)' },
];

export function EvolutionLogView() {
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? EVOLUTION_DATA : EVOLUTION_DATA.filter(e => e.type === filter);

  const dotColor = (type: string) => {
    switch (type) {
      case 'hypothesis': return 'var(--accent-slate)';
      case 'failure': return 'var(--accent)';
      case 'correction': return 'var(--accent-gold)';
      case 'tool-cascade': return 'var(--accent-warm)';
      case 'success': return 'var(--accent-sage)';
      default: return 'var(--ink-muted)';
    }
  };

  return (
    <div className="scroll-area" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
      {/* Telemetry Strip */}
      <div className="card" style={{ padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 9.5, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 2 }}>Active Hypothesis</div>
            <div style={{ fontSize: 14, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--accent)' }}>Graphene-NbSe₂ Superlattice</div>
          </div>
          <div style={{ width: 1, height: 32, background: 'var(--rule-light)' }} />
          <div>
            <div style={{ fontSize: 9.5, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 2 }}>Evolution Depth</div>
            <div style={{ fontSize: 14, fontFamily: 'var(--font-display)', fontWeight: 600 }}>14 Iterations</div>
          </div>
          <div style={{ width: 1, height: 32, background: 'var(--rule-light)' }} />
          <div>
            <div style={{ fontSize: 9.5, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 2 }}>Tool Calls (K2)</div>
            <div style={{ fontSize: 14, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--accent-slate)' }}>342 Executed</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <span className="tag gold">Optimization Mode</span>
          <span className="tag red">Autonomous</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        {/* Self-Correction Path Timeline */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, margin: 0 }}>
              Self-Correction Path
            </h2>
            <div style={{ display: 'flex', gap: 4 }}>
              {['all', 'failure', 'correction', 'success'].map(f => (
                <button key={f} className={`tab-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)} style={{ fontSize: 11, padding: '4px 10px', textTransform: 'capitalize' }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div style={{ position: 'relative', paddingLeft: 4 }}>
            {/* Vertical line */}
            <div style={{ position: 'absolute', left: 11, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, var(--accent-slate), var(--accent), var(--accent-sage))`, opacity: 0.2, borderRadius: 2 }} />

            {filtered.map((entry, i) => (
              <div key={i} className="slide-in" style={{ position: 'relative', paddingLeft: 40, paddingBottom: i < filtered.length - 1 ? 32 : 0 }}>
                {/* Dot */}
                <div style={{
                  position: 'absolute', left: 0, top: 0,
                  width: 24, height: 24, borderRadius: '50%',
                  background: dotColor(entry.type),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--white)', fontSize: 11, fontWeight: 700,
                  boxShadow: `0 0 0 4px ${dotColor(entry.type)}22`,
                }}>
                  {entry.type === 'success' ? '✓' : entry.type === 'failure' ? '✕' : entry.type === 'tool-cascade' ? '⚡' : entry.type === 'correction' ? '↻' : '◆'}
                </div>

                {/* Card */}
                <div style={{
                  padding: '14px 16px',
                  border: `1px solid ${entry.type === 'success' ? 'var(--sage-mid)' : entry.type === 'failure' ? 'var(--accent-mid)' : 'var(--rule)'}`,
                  borderRadius: 'var(--radius-md)',
                  background: entry.type === 'success' ? 'var(--sage-light)' : entry.type === 'failure' ? 'var(--accent-light)' : 'var(--white)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: dotColor(entry.type) }}>
                      {entry.title}
                    </span>
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>{entry.time}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--ink-mid)', lineHeight: 1.6, margin: 0 }}>{entry.content}</p>

                  {entry.correction && (
                    <div style={{ marginTop: 10, padding: '8px 10px', borderLeft: '2px solid var(--accent)', background: 'var(--accent-light)', borderRadius: '0 var(--radius-xs) var(--radius-xs) 0', fontSize: 12 }}>
                      <span style={{ color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.05em' }}>Self-Correction: </span>
                      <span style={{ color: 'var(--ink-mid)' }}>{entry.correction}</span>
                    </div>
                  )}

                  {entry.confidence !== undefined && (
                    <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--ink-muted)' }}>
                      Confidence: <span style={{ fontWeight: 700, color: entry.confidence > 0.8 ? 'var(--accent-sage)' : 'var(--ink-mid)' }}>{(entry.confidence * 100).toFixed(0)}%</span>
                    </div>
                  )}

                  {entry.tools && (
                    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {entry.tools.map((tc, j) => (
                        <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'var(--paper)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--rule-light)' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', color: tc.status === 'OK' ? 'var(--accent-sage)' : 'var(--accent)', minWidth: 22 }}>{tc.status}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-slate)', fontWeight: 600 }}>{tc.name}</span>
                          <span style={{ fontSize: 11, color: 'var(--ink-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tc.desc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side Intelligence Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Analytical Depth */}
          <div className="card" style={{ padding: '18px' }}>
            <h3 style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16, fontFamily: 'var(--font-body)' }}>
              Analytical Depth
            </h3>
            {ANALYTICS.map((m, i) => (
              <div key={i} style={{ marginBottom: i < ANALYTICS.length - 1 ? 14 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: 'var(--ink-mid)' }}>{m.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: m.color, fontFamily: 'var(--font-mono)' }}>{m.value}</span>
                </div>
                <div className="progress-bar" style={{ height: 3 }}>
                  <div className="progress-fill" style={{ width: `${m.pct}%`, background: m.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* K2 Execution Stream (compact) */}
          <div className="card" style={{ padding: '18px', flex: 1 }}>
            <h3 style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, fontFamily: 'var(--font-body)' }}>
              K2 Execution Stream
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { name: 'CRYSTAL_LATTICE_GEN', desc: 'Refining twist angle to 1.08°', status: 'OK' },
                { name: 'DFT_BAND_SOLVER', desc: 'Mapping orbital overlaps', status: 'OK' },
                { name: 'THERMAL_FLUCT_MODEL', desc: 'Divergence in phonon calc', status: 'ERR' },
                { name: 'UNIFIED_SOLVENT_DB', desc: 'Querying dielectric constants', status: 'OK' },
                { name: 'HAMILTONIAN_MATRIX_OP', desc: 'Solving large eigenstate', status: 'OK' },
                { name: 'MONTE_CARLO_SIM', desc: 'Sampling lattice configurations', status: 'OK' },
              ].map((tc, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 10px',
                  background: 'var(--paper)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--rule-light)',
                  opacity: i > 3 ? 0.5 : 1,
                }}>
                  <span style={{ fontSize: 9.5, fontWeight: 700, fontFamily: 'var(--font-mono)', color: tc.status === 'OK' ? 'var(--accent-sage)' : 'var(--accent)', minWidth: 22 }}>{tc.status}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em', color: 'var(--ink-mid)' }} className="truncate">{tc.name}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--ink-muted)', fontStyle: 'italic' }} className="truncate">{tc.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Snapshot Thumbnail */}
          <div className="snapshot-card" style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden' }}>
            <div style={{
              width: '100%', height: '100%',
              background: 'linear-gradient(135deg, var(--paper) 0%, var(--rule-light) 50%, var(--paper) 100%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ fontSize: 40, marginBottom: 8, opacity: 0.3 }}>🔬</div>
              <span style={{ fontSize: 10, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Lattice Projection</span>
              <span style={{ fontSize: 12, fontFamily: 'var(--font-display)', color: 'var(--ink-mid)', marginTop: 2 }}>Iteration 14 Structure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

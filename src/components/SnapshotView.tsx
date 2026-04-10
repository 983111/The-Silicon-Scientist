import React, { useState } from 'react';

interface Snapshot {
  id: string;
  title: string;
  description: string;
  experiment: string;
  iteration: number;
  timestamp: string;
  type: 'lattice' | 'energy' | 'trajectory' | 'band' | 'density';
  gradient: string;
}

const SNAPSHOTS: Snapshot[] = [
  {
    id: 'SNAP-001', title: 'hBN/Graphene Superlattice',
    description: 'Layer-resolved atomic positions at twist angle 1.08°. Shows hexagonal coordination with NbSe₂ intercalation.',
    experiment: 'EXP-0042', iteration: 14, timestamp: '14:22:10', type: 'lattice',
    gradient: 'linear-gradient(135deg, #2d4a6e 0%, #3a6b5a 50%, #111110 100%)',
  },
  {
    id: 'SNAP-002', title: 'Potential Energy Surface',
    description: 'Morse potential fit showing energy minimum at 2.8Å bond distance with -14.22 eV/atom stabilization.',
    experiment: 'EXP-0042', iteration: 12, timestamp: '12:45:33', type: 'energy',
    gradient: 'linear-gradient(135deg, #c0392b 0%, #d4512a 50%, #b8922a 100%)',
  },
  {
    id: 'SNAP-003', title: 'Ion Diffusion Pathway',
    description: 'NEB minimum energy path through lattice channels. 12 intermediate images showing Li⁺ migration.',
    experiment: 'EXP-0039', iteration: 8, timestamp: '09:30:12', type: 'trajectory',
    gradient: 'linear-gradient(135deg, #b8922a 0%, #3a6b5a 50%, #2d4a6e 100%)',
  },
  {
    id: 'SNAP-004', title: 'Electronic Band Structure',
    description: 'PBE+SOC band structure along Γ-M-K-Γ path. Flat band at Fermi level indicates superconducting instability.',
    experiment: 'EXP-0042', iteration: 10, timestamp: '10:15:44', type: 'band',
    gradient: 'linear-gradient(135deg, #111110 0%, #2d4a6e 50%, #c0392b 100%)',
  },
  {
    id: 'SNAP-005', title: 'Charge Density Map',
    description: 'Real-space electron density isosurface at 0.05 e/Å³ showing orbital overlap regions.',
    experiment: 'EXP-0042', iteration: 14, timestamp: '14:10:05', type: 'density',
    gradient: 'linear-gradient(135deg, #3a6b5a 0%, #b8922a 40%, #d4512a 100%)',
  },
  {
    id: 'SNAP-006', title: 'Thermal Stability Map',
    description: 'Temperature-dependent structural integrity. Green regions stable, red regions show decomposition onset.',
    experiment: 'EXP-0038', iteration: 6, timestamp: '04:12:00', type: 'lattice',
    gradient: 'linear-gradient(135deg, #3a6b5a 0%, #c0392b 100%)',
  },
];

const TYPE_ICONS: Record<string, string> = {
  lattice: '⬡', energy: '⚡', trajectory: '→', band: '∿', density: '◉',
};

export function SnapshotView() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  const selected = SNAPSHOTS.find(s => s.id === selectedId);

  return (
    <div className="scroll-area" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.03em' }}>
          Snapshot Viewer
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)', margin: 0 }}>
          Visual outputs from simulations — lattice projections, energy surfaces, band structures
        </p>
      </div>

      {/* Gallery Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {SNAPSHOTS.map(snap => (
          <div
            key={snap.id}
            className="snapshot-card"
            onClick={() => { setSelectedId(snap.id); setFullscreen(true); }}
          >
            {/* Visual area */}
            <div style={{
              height: 200,
              background: snap.gradient,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}>
              <span style={{ fontSize: 48, opacity: 0.25, color: 'white' }}>{TYPE_ICONS[snap.type]}</span>

              {/* CSS-driven overlay — uses .snapshot-card:hover .snapshot-overlay */}
              <div className="snapshot-overlay">
                <button style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'white', fontSize: 11, padding: '5px 12px',
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                  backdropFilter: 'blur(8px)',
                }}>
                  ⛶ Fullscreen
                </button>
              </div>
            </div>

            {/* Info */}
            <div style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span className="tag blue" style={{ fontSize: 9 }}>{snap.type}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-muted)' }}>{snap.experiment}</span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, margin: '0 0 4px', color: 'var(--ink)' }}>
                {snap.title}
              </h3>
              <p style={{
                fontSize: 12, color: 'var(--ink-muted)', margin: 0, lineHeight: 1.5,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {snap.description}
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 10.5, color: 'var(--ink-muted)' }}>
                <span>Iter {snap.iteration}</span>
                <span>{snap.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Viewer */}
      {fullscreen && selected && (
        <div className="fullscreen-viewer fade-in" onClick={() => setFullscreen(false)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: 900, width: '90%',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              background: 'var(--white)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            {/* Visual */}
            <div style={{
              height: 400,
              background: selected.gradient,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}>
              <span style={{ fontSize: 80, opacity: 0.2, color: 'white' }}>{TYPE_ICONS[selected.type]}</span>
              <div style={{ position: 'absolute', top: 16, right: 16 }}>
                <button
                  onClick={() => setFullscreen(false)}
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    color: 'white', fontSize: 16,
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  ✕
                </button>
              </div>
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 100,
                background: 'linear-gradient(to top, rgba(17,17,16,0.6), transparent)',
              }} />
              <div style={{ position: 'absolute', bottom: 16, left: 20, color: 'white' }}>
                <span className="tag blue" style={{ marginBottom: 4 }}>{selected.type}</span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, margin: '4px 0 0', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                  {selected.title}
                </h2>
              </div>
            </div>

            {/* Details */}
            <div style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: 14, color: 'var(--ink-mid)', lineHeight: 1.7, margin: '0 0 16px' }}>
                {selected.description}
              </p>
              <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'var(--ink-muted)' }}>
                <span>Experiment: <strong style={{ color: 'var(--ink)' }}>{selected.experiment}</strong></span>
                <span>Iteration: <strong style={{ color: 'var(--ink)' }}>{selected.iteration}</strong></span>
                <span>Captured: <strong style={{ color: 'var(--ink)' }}>{selected.timestamp}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

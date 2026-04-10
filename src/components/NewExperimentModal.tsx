import React, { useState } from 'react';

interface NewExperimentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (data: any) => void;
}

const TEMPLATES = [
  { label: 'Superconductor', problem: 'Discover a stable room-temperature superconductor using graphene-based superlattice structures and transition metal dichalcogenides.', objectives: '- Maximize critical temperature (Tc) above 300K\n- Minimize required synthesis pressure (<5 GPa)\n- Ensure structural stability at ambient conditions' },
  { label: 'Drug Binding', problem: 'Optimize small molecule binding affinity to the SARS-CoV-2 main protease active site for antiviral drug development.', objectives: '- Maximize binding free energy (ΔG < -12 kcal/mol)\n- Ensure drug-likeness (Lipinski rules)\n- Minimize off-target toxicity' },
  { label: 'Catalyst Design', problem: 'Design a novel heterogeneous catalyst for CO2 reduction to methanol with high selectivity and low overpotential.', objectives: '- Achieve selectivity >90% for methanol\n- Minimize overpotential (<0.4V)\n- Maximize catalyst stability (>1000h)' },
  { label: 'Battery Cathode', problem: 'Optimize lithium iron phosphate cathode material for enhanced energy density while maintaining thermal stability at high charge rates.', objectives: '- Energy density > 200 Wh/kg\n- Thermal stability up to 60°C at 4C rate\n- Cycle life > 2000 cycles' },
];

export function NewExperimentModal({ isOpen, onClose, onStart }: NewExperimentModalProps) {
  const [problem, setProblem] = useState('');
  const [context, setContext] = useState('');
  const [objectives, setObjectives] = useState('');
  const [constraints, setConstraints] = useState('');
  const [iterations, setIterations] = useState(5);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  if (!isOpen) return null;

  const applyTemplate = (idx: number) => {
    const t = TEMPLATES[idx];
    setProblem(t.problem);
    setObjectives(t.objectives);
    setSelectedTemplate(idx);
  };

  const handleStart = () => {
    if (!problem.trim() || !objectives.trim()) return;
    onStart({ problem, context, objectives, constraints, iterations });
    onClose();
    // Reset
    setProblem(''); setContext(''); setObjectives(''); setConstraints('');
    setIterations(5); setSelectedTemplate(null);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card slide-in" style={{ width: '100%', maxWidth: 640, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--rule)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ink)', margin: 0, lineHeight: 1.2 }}>
                Initialize Experiment
              </h2>
              <p style={{ fontSize: 13, color: 'var(--ink-muted)', margin: '4px 0 0', fontWeight: 400 }}>
                Define the scientific problem for autonomous K2 research
              </p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--ink-muted)', padding: 4, borderRadius: 6, lineHeight: 1 }}>
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="scroll-area" style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
          {/* Templates */}
          <div style={{ marginBottom: 20 }}>
            <label className="field-label">Quick Templates</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {TEMPLATES.map((t, i) => (
                <button
                  key={i}
                  onClick={() => applyTemplate(i)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: `1.5px solid ${selectedTemplate === i ? 'var(--accent)' : 'var(--rule)'}`,
                    background: selectedTemplate === i ? 'var(--accent-light)' : 'var(--white)',
                    color: selectedTemplate === i ? 'var(--accent)' : 'var(--ink-mid)',
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Problem */}
          <div style={{ marginBottom: 16 }}>
            <label className="field-label">Scientific Problem / Hypothesis *</label>
            <textarea
              id="experiment-problem"
              className="input-field"
              rows={3}
              value={problem}
              onChange={e => setProblem(e.target.value)}
              placeholder="Describe the scientific problem you want Silicon Scientist to investigate autonomously..."
            />
          </div>

          {/* Context */}
          <div style={{ marginBottom: 16 }}>
            <label className="field-label">Background Context</label>
            <textarea
              className="input-field"
              rows={2}
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder="Relevant literature, known constants, prior simulation data, constraints..."
            />
          </div>

          {/* Objectives + Constraints */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div>
              <label className="field-label">Key Objectives *</label>
              <textarea
                className="input-field"
                rows={4}
                value={objectives}
                onChange={e => setObjectives(e.target.value)}
                placeholder={"- Maximize Tc above 300K\n- Minimize synthesis energy\n- Ensure stability"}
              />
            </div>
            <div>
              <label className="field-label">Constraints</label>
              <textarea
                className="input-field"
                rows={4}
                value={constraints}
                onChange={e => setConstraints(e.target.value)}
                placeholder={"- Non-toxic elements only\n- Pressure < 10 GPa\n- Earth-abundant materials"}
              />
            </div>
          </div>

          {/* Iterations */}
          <div style={{ padding: '16px', background: 'var(--paper)', borderRadius: 'var(--radius-md)', border: '1px solid var(--rule-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Max Autonomous Iterations</div>
                <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 2 }}>Each iteration runs: Write → Execute → Analyze → Correct</div>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 600, color: 'var(--accent)' }}>{iterations}</div>
            </div>
            <input
              type="range"
              min="3"
              max="20"
              step="1"
              value={iterations}
              onChange={e => setIterations(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
              <span>3 (quick)</span>
              <span>20 (deep)</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--rule)', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0, background: 'var(--white)' }}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary accent"
            onClick={handleStart}
            disabled={!problem.trim() || !objectives.trim()}
            style={{ opacity: (!problem.trim() || !objectives.trim()) ? 0.5 : 1, cursor: (!problem.trim() || !objectives.trim()) ? 'not-allowed' : 'pointer' }}
          >
            ▶ Start Research Loop
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';

interface NewExperimentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (data: any) => void;
}

const TEMPLATES = [
  {
    label: 'ML Model Optimization',
    problem: 'Design and evaluate an efficient gradient-boosting ensemble for classification. Explore hyperparameter sensitivity and feature importance on a synthetic dataset.',
    objectives: '- Maximize F1-score and AUC-ROC above 90%\n- Minimize inference latency\n- Visualize decision boundary and feature importances',
    constraints: '- Use only scikit-learn compatible interfaces\n- Training time < 30 seconds'
  },
  {
    label: 'Generative Art & UI',
    problem: 'Create a visually stunning, responsive glassmorphism dashboard component using pure HTML and CSS. Include animated gradients and micro-interactions.',
    objectives: '- Achieve WCAG AA contrast compliance\n- Implement smooth hover transitions and animations\n- Generate a complete, self-contained HTML artifact',
    constraints: '- No external CSS frameworks or JavaScript libraries\n- Must work standalone in a browser'
  },
  {
    label: 'Protein Folding Analysis',
    problem: 'Simulate and analyze secondary structure propensity of a synthetic peptide sequence using energy minimization and statistical mechanics principles.',
    objectives: '- Compute helix/sheet/coil propensities\n- Map free energy landscape across conformations\n- Identify stable folding motifs',
    constraints: '- Use numpy and scipy only\n- Represent up to 50 amino acid residues'
  },
  {
    label: 'Data Pattern Discovery',
    problem: 'Apply unsupervised learning to discover latent clusters and anomalies in a high-dimensional synthetic dataset. Evaluate cluster quality and visualize manifold structure.',
    objectives: '- Achieve silhouette score > 0.6\n- Detect and flag outliers\n- Reduce dimensions and visualize cluster separation',
    constraints: '- Max 5000 samples\n- Compare at least 2 clustering algorithms'
  },
  {
    label: 'Climate Model Simulation',
    problem: 'Create a simplified atmospheric CO2 feedback model. Simulate temperature evolution under different emission scenarios over a 100-year horizon.',
    objectives: '- Model radiative forcing from CO₂ concentration\n- Compare RCP 2.6, 4.5, and 8.5 emission pathways\n- Identify tipping points and feedback thresholds',
    constraints: '- Energy balance model (EBM) approach\n- Time step: 1 year'
  },
  {
    label: 'Quantum Circuit Design',
    problem: 'Simulate a 3-qubit quantum circuit implementing Grover\'s search algorithm. Measure amplitude amplification and compare classical vs quantum search complexity.',
    objectives: '- Implement oracle and diffusion operators\n- Show quadratic speedup over classical search\n- Visualize probability amplitude evolution',
    constraints: '- Use numpy matrix operations only\n- Limit to pure state simulation'
  },
  {
    label: 'Drug-Target Binding',
    problem: 'Model the binding affinity between a small molecule ligand and a protein receptor using molecular docking scoring functions and thermodynamic approximations.',
    objectives: '- Estimate binding free energy (ΔG)\n- Identify key interacting residues\n- Compare multiple ligand poses',
    constraints: '- Use simplified force field\n- 3D coordinate generation via RDKit-style logic in numpy'
  },
  {
    label: 'Cryptographic Protocol',
    problem: 'Implement and analyze the security of a lattice-based post-quantum cryptographic scheme. Evaluate correctness, hardness assumptions, and key sizes.',
    objectives: '- Implement Learning With Errors (LWE) encryption\n- Verify decryption correctness under noise\n- Evaluate security parameter tradeoffs',
    constraints: '- Standard Python + numpy only\n- Parameter sets: n=256, q=7681'
  },
];

export function NewExperimentModal({ isOpen, onClose, onStart }: NewExperimentModalProps) {
  const [problem, setProblem] = useState('');
  const [context, setContext] = useState('');
  const [objectives, setObjectives] = useState('');
  const [constraints, setConstraints] = useState('');
  const [iterations, setIterations] = useState(5);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  // Listen for pre-fill events from Research Browser
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail?.problem) setProblem(e.detail.problem);
      if (e.detail?.objectives) setObjectives(e.detail.objectives);
      if (e.detail?.context) setContext(e.detail.context);
      setSelectedTemplate(null);
    };
    window.addEventListener('silicon:open-modal-prefill', handler as EventListener);
    return () => window.removeEventListener('silicon:open-modal-prefill', handler as EventListener);
  }, []);

  if (!isOpen) return null;

  const applyTemplate = (idx: number) => {
    const t = TEMPLATES[idx];
    setProblem(t.problem);
    setObjectives(t.objectives);
    setConstraints(t.constraints);
    setContext('');
    setSelectedTemplate(idx);
  };

  const handleStart = () => {
    if (!problem.trim() || !objectives.trim()) return;
    onStart({ problem, context, objectives, constraints, iterations });
    onClose();
    setProblem(''); setContext(''); setObjectives(''); setConstraints('');
    setIterations(5); setSelectedTemplate(null);
  };

  const isValid = problem.trim().length >= 20 && objectives.trim().length >= 10;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card slide-in" style={{ width: '100%', maxWidth: 700, maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--rule)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ink)', margin: 0, lineHeight: 1.2 }}>
                Initialize Research Experiment
              </h2>
              <p style={{ fontSize: 13, color: 'var(--ink-muted)', margin: '4px 0 0', fontWeight: 400 }}>
                Define your scientific problem — K2 will autonomously investigate, write code, and generate visual artifacts
              </p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--ink-muted)', padding: 4, borderRadius: 6, lineHeight: 1 }}>
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="scroll-area" style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
          {/* Templates */}
          <div style={{ marginBottom: 24 }}>
            <label className="field-label">Quick Start Templates</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {TEMPLATES.map((t, i) => (
                <button
                  key={i}
                  onClick={() => applyTemplate(i)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${selectedTemplate === i ? 'var(--accent)' : 'var(--rule)'}`,
                    background: selectedTemplate === i ? 'var(--accent-light)' : 'var(--paper)',
                    color: selectedTemplate === i ? 'var(--accent)' : 'var(--ink-mid)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    fontFamily: 'var(--font-body)',
                    textAlign: 'left',
                    lineHeight: 1.3,
                  }}
                >
                  <span style={{ display: 'block', fontSize: 16, marginBottom: 4, letterSpacing: '0.02em', color: 'var(--accent)' }}>{(i + 1).toString().padStart(2, '0')}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Problem */}
          <div style={{ marginBottom: 16 }}>
            <label className="field-label">
              Scientific Problem / Hypothesis *
              <span style={{ fontSize: 10, color: problem.trim().length >= 20 ? 'var(--accent-sage)' : 'var(--ink-muted)', marginLeft: 8, fontWeight: 400, textTransform: 'none' }}>
                {problem.trim().length >= 20 ? '✓ Good' : `${Math.max(0, 20 - problem.trim().length)} more chars needed`}
              </span>
            </label>
            <textarea
              id="experiment-problem"
              className="input-field"
              rows={3}
              value={problem}
              onChange={e => { setProblem(e.target.value); setSelectedTemplate(null); }}
              placeholder="Describe the scientific problem, hypothesis, or topic you want Silicon Scientist to autonomously investigate..."
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
              placeholder="Relevant background: prior results, domain knowledge, known equations, research paper references..."
            />
          </div>

          {/* Objectives + Constraints */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div>
              <label className="field-label">
                Key Objectives *
                <span style={{ fontSize: 10, color: objectives.trim().length >= 10 ? 'var(--accent-sage)' : 'var(--ink-muted)', marginLeft: 8, fontWeight: 400, textTransform: 'none' }}>
                  {objectives.trim().length >= 10 ? '✓' : ''}
                </span>
              </label>
              <textarea
                className="input-field"
                rows={4}
                value={objectives}
                onChange={e => setObjectives(e.target.value)}
                placeholder={"- Maximize performance metric\n- Minimize computational cost\n- Generate visual analysis"}
              />
            </div>
            <div>
              <label className="field-label">Constraints</label>
              <textarea
                className="input-field"
                rows={4}
                value={constraints}
                onChange={e => setConstraints(e.target.value)}
                placeholder={"- Standard libraries only\n- Time complexity < O(n²)\n- No external API calls"}
              />
            </div>
          </div>

          {/* Iterations */}
          <div style={{ padding: '16px 18px', background: 'var(--paper)', borderRadius: 'var(--radius-md)', border: '1px solid var(--rule-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Max Autonomous Iterations</div>
                <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 2 }}>
                  Each iteration: <strong>Hypothesize → Write → Execute → Analyze → Self-Correct</strong>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>{iterations}</div>
                <div style={{ fontSize: 10, color: 'var(--ink-muted)', marginTop: 2 }}>iteration{iterations !== 1 ? 's' : ''}</div>
              </div>
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
              <span>3 — quick probe</span>
              <span style={{ color: iterations >= 10 ? 'var(--accent-gold)' : 'var(--ink-muted)' }}>
                {iterations >= 15 ? '⚠ long runtime' : iterations >= 10 ? '~ moderate runtime' : ''}
              </span>
              <span>20 — deep research</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--rule)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexShrink: 0, background: 'var(--white)' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
            {isValid ? (
              <span style={{ color: 'var(--accent-sage)' }}>✓ Ready to launch {iterations}-iteration research loop</span>
            ) : (
              <span>Fill in the problem statement and objectives to continue</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            <button
              className="btn-primary accent"
              onClick={handleStart}
              disabled={!isValid}
              style={{ opacity: !isValid ? 0.5 : 1, cursor: !isValid ? 'not-allowed' : 'pointer' }}
            >
              ▶ Start Research Loop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

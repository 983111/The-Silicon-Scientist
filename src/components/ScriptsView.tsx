import React, { useState } from 'react';

// ── Script Repository: centralized storage with preview, status, and reuse

interface Script {
  id: string;
  name: string;
  description: string;
  language: string;
  experiment: string;
  status: 'active' | 'idle' | 'deprecated';
  lastRun: string;
  lines: number;
  code: string;
}

const SCRIPTS: Script[] = [
  {
    id: 'S001', name: 'monte_carlo_v2.py',
    description: 'Iterative Monte Carlo sampling for cathode porosity optimization. Uses Metropolis-Hastings algorithm with adaptive step size.',
    language: 'Python', experiment: 'EXP-0042', status: 'active', lastRun: '2m ago', lines: 142,
    code: `import numpy as np
from scipy.stats import norm
import json

# Monte Carlo Porosity Sampler v2.0
# Uses Metropolis-Hastings with adaptive step

class PorositySampler:
    def __init__(self, n_samples=10000, T=300):
        self.n_samples = n_samples
        self.temperature = T
        self.step_size = 0.1
        self.acceptance_rate = 0.0
        
    def energy(self, config):
        """Compute lattice energy for configuration"""
        E = -np.sum(config * np.roll(config, 1))
        E += 0.5 * np.sum(config**2)
        return E
    
    def metropolis_step(self, config):
        """Single Metropolis-Hastings step"""
        trial = config + np.random.normal(0, self.step_size)
        dE = self.energy(trial) - self.energy(config)
        if dE < 0 or np.random.random() < np.exp(-dE/self.temperature):
            return trial, True
        return config, False

    def run(self):
        config = np.random.random(64)
        accepted = 0
        energies = []
        for i in range(self.n_samples):
            config, acc = self.metropolis_step(config)
            if acc: accepted += 1
            energies.append(self.energy(config))
        self.acceptance_rate = accepted / self.n_samples
        return energies

sampler = PorositySampler(n_samples=50000, T=152)
results = sampler.run()
print(f"Acceptance rate: {sampler.acceptance_rate:.3f}")
print(f"Final energy: {results[-1]:.4f}")`,
  },
  {
    id: 'S002', name: 'thermal_stress.py',
    description: 'Gradient analysis at 4C discharge rate. Finite element thermal model with multi-physics coupling.',
    language: 'Python', experiment: 'EXP-0039', status: 'idle', lastRun: '3h ago', lines: 98,
    code: `import numpy as np
from scipy.integrate import solve_ivp

# Thermal Stress Analysis — 4C Discharge
# Finite element model with Joule heating

def thermal_gradient(t, T, I_rate=4.0):
    """dT/dt for battery cell thermal model"""
    Q_joule = I_rate**2 * R_internal(T)
    Q_conv = -h_conv * A_surf * (T - T_ambient)
    return (Q_joule + Q_conv) / (m_cell * Cp)

def R_internal(T):
    return R0 * np.exp(Ea / (k_B * T))

# Constants
R0, Ea, k_B = 0.05, 0.3, 8.617e-5
h_conv, A_surf = 10.0, 0.02
T_ambient, m_cell, Cp = 298, 0.045, 1000

sol = solve_ivp(thermal_gradient, [0, 3600], [298],
                max_step=1.0, dense_output=True)
print(f"Max temp: {sol.y[0].max():.1f} K")`,
  },
  {
    id: 'S003', name: 'lattice_opt.py',
    description: 'Geometry optimization using BFGS for crystalline stability of hBN/Graphene superlattice.',
    language: 'Python', experiment: 'EXP-0042', status: 'idle', lastRun: '1d ago', lines: 76,
    code: `import numpy as np
from scipy.optimize import minimize

# Lattice Geometry Optimizer
# BFGS with analytical gradients

def lattice_energy(params):
    a, c, theta = params
    E_elastic = 0.5 * k_spring * (a - a0)**2
    E_vdw = -C6 / (c**6) + C12 / (c**12)
    E_twist = J * (1 - np.cos(theta - theta_opt))
    return E_elastic + E_vdw + E_twist

a0, k_spring = 2.46, 15.0
C6, C12 = 1.0, 0.001
J, theta_opt = 0.5, np.radians(1.08)

result = minimize(lattice_energy, [2.5, 6.5, 0.02],
                  method='BFGS')
print(f"Optimal: a={result.x[0]:.3f}, c={result.x[1]:.3f}")
print(f"Twist: {np.degrees(result.x[2]):.2f}°")`,
  },
  {
    id: 'S004', name: 'viscosity_calc.py',
    description: 'Electrolyte viscosity calculation using Green-Kubo formalism from MD trajectory data.',
    language: 'Python', experiment: 'EXP-0041', status: 'deprecated', lastRun: '5d ago', lines: 54,
    code: `import numpy as np

# Green-Kubo Viscosity Calculator
# From molecular dynamics stress tensor autocorrelation

def green_kubo_viscosity(stress_trajectory, dt, T, V):
    """Compute viscosity from stress tensor ACF"""
    kB = 1.380649e-23
    N = len(stress_trajectory)
    acf = np.correlate(stress_trajectory, stress_trajectory, 'full')
    acf = acf[N-1:] / np.arange(N, 0, -1)
    eta = (V / (kB * T)) * np.trapz(acf, dx=dt)
    return eta

# Load trajectory (simulated)
np.random.seed(42)
stress = np.random.normal(0, 1e6, 10000)
dt, T, V = 1e-15, 298, 1e-27

eta = green_kubo_viscosity(stress, dt, T, V)
print(f"Viscosity: {eta:.4e} Pa·s")`,
  },
  {
    id: 'S005', name: 'ion_path_trace.py',
    description: 'Ionic diffusion pathway tracing through crystalline lattice channels using NEB method.',
    language: 'Python', experiment: 'EXP-0039', status: 'idle', lastRun: '2d ago', lines: 88,
    code: `import numpy as np

# Nudged Elastic Band (NEB) Ion Path Tracer
# Finds minimum energy pathway for ionic diffusion

def neb_force(images, k_spring=0.1):
    """Compute NEB forces on intermediate images"""
    forces = []
    for i in range(1, len(images) - 1):
        tangent = images[i+1] - images[i-1]
        tangent /= np.linalg.norm(tangent)
        F_real = -gradient(images[i])
        F_perp = F_real - np.dot(F_real, tangent) * tangent
        F_spring = k_spring * (
            np.linalg.norm(images[i+1] - images[i]) -
            np.linalg.norm(images[i] - images[i-1])
        ) * tangent
        forces.append(F_perp + F_spring)
    return forces

def gradient(pos):
    return 2 * pos * np.sin(np.sum(pos))

N_images = 12
start = np.array([0.0, 0.0, 0.0])
end = np.array([2.46, 2.46, 6.7])
images = [start + i/(N_images-1) * (end - start) for i in range(N_images)]
print(f"NEB initialized with {N_images} images")
print(f"Path length: {np.linalg.norm(end - start):.3f} Å")`,
  },
];

function syntaxHighlight(code: string): React.ReactNode {
  return code.split('\n').map((line, i) => {
    let processed: React.ReactNode = line;
    if (line.trim().startsWith('#')) {
      processed = <span style={{ color: 'var(--ink-muted)', fontStyle: 'italic' }}>{line}</span>;
    } else if (line.trim().startsWith('import ') || line.trim().startsWith('from ')) {
      processed = <span style={{ color: 'var(--accent)' }}>{line}</span>;
    } else if (line.trim().startsWith('def ') || line.trim().startsWith('class ')) {
      processed = <span style={{ color: 'var(--accent-slate)' }}>{line}</span>;
    } else if (line.trim().startsWith('print') || line.trim().startsWith('return')) {
      processed = <span style={{ color: 'var(--accent-warm)' }}>{line}</span>;
    }
    return (
      <div key={i} style={{ display: 'flex', gap: 0, minHeight: '1.5em' }}>
        <span style={{ color: 'var(--ink-muted)', minWidth: '2.5rem', paddingRight: 12, textAlign: 'right', userSelect: 'none', opacity: 0.4, fontSize: 11 }}>{i + 1}</span>
        <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: 12 }}>{processed}</span>
      </div>
    );
  });
}

export function ScriptsView() {
  const [selectedId, setSelectedId] = useState<string>(SCRIPTS[0].id);
  const [searchQuery, setSearchQuery] = useState('');

  const selected = SCRIPTS.find(s => s.id === selectedId) || SCRIPTS[0];
  const filtered = searchQuery
    ? SCRIPTS.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.description.toLowerCase().includes(searchQuery.toLowerCase()))
    : SCRIPTS;

  const statusColor = (s: string) => {
    if (s === 'active') return 'green';
    if (s === 'idle') return 'muted';
    return 'red';
  };

  return (
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '320px 1fr', overflow: 'hidden', height: '100%' }}>
      {/* Script List */}
      <div style={{ borderRight: '1px solid var(--rule)', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--white)' }}>
        <div style={{ padding: '18px', borderBottom: '1px solid var(--rule)', flexShrink: 0 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, margin: '0 0 10px' }}>Script Repository</h2>
          <input
            className="input-field"
            placeholder="Search scripts..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ fontSize: 13 }}
          />
        </div>
        <div className="scroll-area" style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {filtered.map(script => (
            <button
              key={script.id}
              onClick={() => setSelectedId(script.id)}
              style={{
                width: '100%', textAlign: 'left',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                border: selectedId === script.id ? '1px solid var(--accent)' : '1px solid transparent',
                background: selectedId === script.id ? 'var(--accent-light)' : 'transparent',
                cursor: 'pointer',
                marginBottom: 4,
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 600, color: selectedId === script.id ? 'var(--accent)' : 'var(--ink)' }}>
                  {script.name}
                </span>
                <span className={`tag ${statusColor(script.status)}`} style={{ marginLeft: 'auto' }}>{script.status}</span>
              </div>
              <p style={{ fontSize: 11.5, color: 'var(--ink-muted)', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {script.description}
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                <span style={{ fontSize: 10.5, color: 'var(--ink-muted)' }}>⏱ {script.lastRun}</span>
                <span style={{ fontSize: 10.5, color: 'var(--ink-muted)' }}>{script.lines} lines</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Code Preview */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--off-white)' }}>
        {/* Preview header */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--rule)', background: 'var(--white)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{selected.name}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 2 }}>{selected.description}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className={`tag ${statusColor(selected.status)}`}>{selected.status}</span>
              <span className="tag blue">{selected.language}</span>
              <button className="btn-ghost" style={{ fontSize: 12, padding: '5px 12px' }}>📋 Copy</button>
              <button className="btn-primary sage" style={{ fontSize: 12, padding: '5px 12px' }}>▶ Reuse</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>Experiment: <strong style={{ color: 'var(--ink-mid)' }}>{selected.experiment}</strong></span>
            <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>Last run: <strong style={{ color: 'var(--ink-mid)' }}>{selected.lastRun}</strong></span>
            <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{selected.lines} lines</span>
          </div>
        </div>

        {/* Code */}
        <div className="scroll-area" style={{
          flex: 1, overflowY: 'auto',
          padding: '16px 20px',
          fontFamily: 'var(--font-mono)',
          fontSize: 12.5, lineHeight: 1.6,
          background: 'var(--paper)',
        }}>
          {syntaxHighlight(selected.code)}
        </div>
      </div>
    </div>
  );
}

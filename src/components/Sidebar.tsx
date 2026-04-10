import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNewExperiment: () => void;
}

const NAV_SECTIONS = [
  {
    label: 'Intelligence',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: '◫' },
      { id: 'workspace', label: 'Lab Workspace', icon: '⚗' },
      { id: 'evolution-log', label: 'Evolution Log', icon: '⟳' },
      { id: 'tool-stream', label: 'Tool Stream', icon: '⚡' },
      { id: 'telemetry', label: 'Telemetry', icon: '◉' },
    ],
  },
  {
    label: 'Data & Analysis',
    items: [
      { id: 'data-explorer', label: 'Data Explorer', icon: '◈' },
      { id: 'performance', label: 'Performance', icon: '▦' },
    ],
  },
  {
    label: 'Management',
    items: [
      { id: 'scripts', label: 'Script Repository', icon: '❮❯' },
      { id: 'snapshots', label: 'Snapshots', icon: '⊡' },
    ],
  },
];

export function Sidebar({ activeTab, setActiveTab, onNewExperiment }: SidebarProps) {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
          <div style={{
            width: 36, height: 36,
            background: 'var(--ink)',
            borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 17, fontWeight: 600,
          }}>⚗</div>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--ink)',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}>
              Silicon Scientist
            </div>
            <div style={{
              fontSize: 10.5,
              color: 'var(--ink-muted)',
              letterSpacing: '0.06em',
              fontWeight: 500,
              textTransform: 'uppercase' as const,
            }}>
              Autonomous Lab Agent
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--rule)', margin: '0 16px 8px' }} />

      {/* New Experiment */}
      <div style={{ padding: '4px 12px 12px' }}>
        <button
          className="btn-primary accent"
          style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', borderRadius: 'var(--radius-md)' }}
          onClick={onNewExperiment}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
          New Experiment
        </button>
      </div>

      {/* Navigation sections */}
      <nav className="scroll-area" style={{ flex: 1, padding: '0 8px', overflowY: 'auto' }}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <div className="nav-section">{section.label}</div>
            {section.items.map(item => (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="icon" style={{ fontSize: 13, letterSpacing: item.icon.length > 1 ? '-0.2em' : 0 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom — Settings + API Status */}
      <div style={{ borderTop: '1px solid var(--rule)', padding: '8px' }}>
        <button
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <span className="icon" style={{ fontSize: 14 }}>⚙</span>
          Settings
        </button>

        <div style={{
          margin: '4px 4px 8px',
          padding: '10px 12px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--paper)',
          border: '1px solid var(--rule-light)',
        }}>
          <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginBottom: 4, fontWeight: 600 }}>K2-Think-v2 Model</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--accent-sage)',
              }}
              className="pulse"
            />
            <span style={{ fontSize: 11, color: 'var(--accent-sage)', fontWeight: 600 }}>
              Ready
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

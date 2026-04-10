import React, { useState, useEffect } from 'react';

// ── Settings View: Worker URL configuration, API keys, preferences

export function SettingsView() {
  const [workerUrl, setWorkerUrl] = useState('');
  const [k2ApiKey, setK2ApiKey] = useState('');
  const [autoConnect, setAutoConnect] = useState(true);
  const [telemetryRefresh, setTelemetryRefresh] = useState(2);
  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  useEffect(() => {
    setWorkerUrl(localStorage.getItem('silicon-worker-url') || '');
    setK2ApiKey(localStorage.getItem('silicon-k2-key') || '');
    setAutoConnect(localStorage.getItem('silicon-auto-connect') !== 'false');
    setTelemetryRefresh(parseInt(localStorage.getItem('silicon-telemetry-refresh') || '2'));
  }, []);

  const handleSave = () => {
    localStorage.setItem('silicon-worker-url', workerUrl);
    localStorage.setItem('silicon-k2-key', k2ApiKey);
    localStorage.setItem('silicon-auto-connect', String(autoConnect));
    localStorage.setItem('silicon-telemetry-refresh', String(telemetryRefresh));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    window.dispatchEvent(new CustomEvent('silicon:settings-changed'));
  };

  const handleTest = async () => {
    if (!workerUrl) return;
    setTestResult('testing');
    try {
      const res = await fetch(`${workerUrl}/api/health`, { method: 'GET', signal: AbortSignal.timeout(8000) });
      setTestResult(res.ok ? 'success' : 'error');
    } catch {
      setTestResult('error');
    }
    setTimeout(() => setTestResult('idle'), 4000);
  };

  return (
    <div className="scroll-area" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.03em' }}>
            Settings
          </h1>
          <p style={{ fontSize: 13, color: 'var(--ink-muted)', margin: 0 }}>
            Configure your Silicon Scientist instance
          </p>
        </div>

        {/* Worker URL */}
        <div className="card" style={{ overflow: 'hidden', marginBottom: 16 }}>
          <div className="settings-section">
            <h3>☁ Cloudflare Worker URL</h3>
            <p>Enter the URL of your deployed Silicon Scientist backend Worker. This is the endpoint that runs K2-Think-v2 experiments.</p>

            <div style={{ marginBottom: 12 }}>
              <label className="field-label">Worker Endpoint URL</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  id="settings-worker-url"
                  className="input-field"
                  placeholder="https://silicon-scientist-worker.your-subdomain.workers.dev"
                  value={workerUrl}
                  onChange={e => setWorkerUrl(e.target.value)}
                  style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: 12.5 }}
                />
                <button
                  className="btn-ghost"
                  onClick={handleTest}
                  disabled={!workerUrl || testResult === 'testing'}
                  style={{
                    opacity: (!workerUrl || testResult === 'testing') ? 0.5 : 1,
                    minWidth: 100,
                    justifyContent: 'center',
                  }}
                >
                  {testResult === 'testing' ? (
                    <span className="spin" style={{ display: 'inline-block' }}>◌</span>
                  ) : testResult === 'success' ? (
                    <span style={{ color: 'var(--accent-sage)' }}>✓ Online</span>
                  ) : testResult === 'error' ? (
                    <span style={{ color: 'var(--accent)' }}>✕ Failed</span>
                  ) : (
                    'Test'
                  )}
                </button>
              </div>
            </div>

            <div style={{
              padding: '10px 14px',
              background: 'var(--paper)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--rule-light)',
              fontSize: 12,
              color: 'var(--ink-muted)',
              lineHeight: 1.6,
            }}>
              <strong style={{ color: 'var(--ink-mid)' }}>Setup:</strong> Deploy the <code style={{ background: 'var(--rule-light)', padding: '1px 5px', borderRadius: 3, fontSize: 11.5, fontFamily: 'var(--font-mono)' }}>chat.js</code> file as a Cloudflare Worker. The worker handles K2 model communication, experiment orchestration, and SSE streaming.
            </div>
          </div>
        </div>

        {/* K2 API Key */}
        <div className="card" style={{ overflow: 'hidden', marginBottom: 16 }}>
          <div className="settings-section">
            <h3>🔑 K2 API Configuration</h3>
            <p>Your K2-Think-v2 API key is stored in the Cloudflare Worker environment. This field is for local reference only.</p>

            <div style={{ marginBottom: 12 }}>
              <label className="field-label">K2 API Key (Reference)</label>
              <input
                id="settings-k2-key"
                className="input-field"
                type="password"
                placeholder="sk-xxxxxxxxxxxx"
                value={k2ApiKey}
                onChange={e => setK2ApiKey(e.target.value)}
                style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginBottom: 2, fontWeight: 600 }}>Model</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--ink)', fontWeight: 500 }}>MBZUAI-IFM/K2-Think-v2</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginBottom: 2, fontWeight: 600 }}>Temperature</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--ink)', fontWeight: 500 }}>0.8</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginBottom: 2, fontWeight: 600 }}>Endpoint</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--ink)', fontWeight: 500 }}>api.k2think.ai</div>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="card" style={{ overflow: 'hidden', marginBottom: 16 }}>
          <div className="settings-section">
            <h3>⚙ Preferences</h3>
            <p>Customize how Silicon Scientist behaves.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Auto-connect */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Auto-connect on startup</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 1 }}>Automatically check API connectivity when the app loads</div>
                </div>
                <button
                  onClick={() => setAutoConnect(!autoConnect)}
                  style={{
                    width: 44, height: 24, borderRadius: 12,
                    background: autoConnect ? 'var(--accent-sage)' : 'var(--rule)',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s ease',
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: 'var(--white)',
                    position: 'absolute',
                    top: 3,
                    left: autoConnect ? 22 : 4,
                    transition: 'left 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </button>
              </div>

              {/* Telemetry refresh */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Telemetry refresh rate</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 1 }}>How often telemetry data updates (in seconds)</div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600, color: 'var(--accent)' }}>
                    {telemetryRefresh}s
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={telemetryRefresh}
                  onChange={e => setTelemetryRefresh(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--ink-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                  <span>1s (real-time)</span>
                  <span>10s (battery-saver)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="card" style={{ overflow: 'hidden', marginBottom: 24 }}>
          <div className="settings-section">
            <h3>ℹ System Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
              {[
                { label: 'Platform', value: 'Silicon Scientist v1.0' },
                { label: 'AI Model', value: 'K2-Think-v2' },
                { label: 'Architecture', value: 'Event-Driven (CustomEvents)' },
                { label: 'Frontend', value: 'React + Vite + TypeScript' },
                { label: 'Backend', value: 'Cloudflare Worker (Hono)' },
                { label: 'Streaming', value: 'SSE with Think-Block Stripping' },
              ].map((info, i) => (
                <div key={i}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--ink-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 3 }}>{info.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{info.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          {saved && (
            <span className="slide-in" style={{ fontSize: 13, color: 'var(--accent-sage)', fontWeight: 600, alignSelf: 'center' }}>
              ✓ Settings saved
            </span>
          )}
          <button className="btn-primary" onClick={handleSave} style={{ padding: '10px 24px' }}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

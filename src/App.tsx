import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { WorkspaceView } from './components/WorkspaceView';
import { EvolutionLogView } from './components/EvolutionLogView';
import { DataExplorerView } from './components/DataExplorerView';
import { TelemetryView } from './components/TelemetryView';
import { ToolStreamView } from './components/ToolStreamView';
import { PerformanceView } from './components/PerformanceView';
import { ScriptsView } from './components/ScriptsView';
import { SnapshotView } from './components/SnapshotView';
import { SettingsView } from './components/SettingsView';
import { NewExperimentModal } from './components/NewExperimentModal';

export function getWorkerUrl(): string {
  // Priority: settings override → env var → empty
  return (
    localStorage.getItem('silicon-worker-url') ||
    (import.meta as any).env?.VITE_WORKER_URL ||
    ''
  );
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  // Check API connectivity
  const checkApi = useCallback(async () => {
    const url = getWorkerUrl();
    if (!url) {
      setApiConnected(false);
      return;
    }
    try {
      const res = await fetch(`${url}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      setApiConnected(res.ok);
    } catch {
      setApiConnected(false);
    }
  }, []);

  useEffect(() => {
    checkApi();
    const interval = setInterval(checkApi, 30000);
    return () => clearInterval(interval);
  }, [checkApi]);

  // Listen for workspace requesting modal open
  useEffect(() => {
    const handler = () => setIsModalOpen(true);
    window.addEventListener('silicon:open-modal', handler);
    return () => window.removeEventListener('silicon:open-modal', handler);
  }, []);

  // Track simulation state from workspace events
  useEffect(() => {
    const startHandler = () => setIsSimulating(true);
    const stopHandler  = () => setIsSimulating(false);
    window.addEventListener('silicon:start-experiment', startHandler);
    window.addEventListener('silicon:simulation-ended', stopHandler);
    return () => {
      window.removeEventListener('silicon:start-experiment', startHandler);
      window.removeEventListener('silicon:simulation-ended', stopHandler);
    };
  }, []);

  // Re-check API after settings change
  useEffect(() => {
    const handler = () => checkApi();
    window.addEventListener('silicon:settings-changed', handler);
    return () => window.removeEventListener('silicon:settings-changed', handler);
  }, [checkApi]);

  // Search → navigate to workspace or dashboard
  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    if (q.trim()) {
      // Navigate to workspace to see experiments
      setActiveTab('workspace');
    }
  }, []);

  const handleStartExperiment = (data: any) => {
    setIsModalOpen(false);
    setActiveTab('workspace');
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('silicon:start-experiment', { detail: data }));
    }, 80);
  };

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':    return <DashboardView onNewExperiment={() => setIsModalOpen(true)} onNavigate={setActiveTab} />;
      case 'workspace':    return <WorkspaceView showToast={showToast} />;
      case 'evolution-log': return <EvolutionLogView />;
      case 'tool-stream':  return <ToolStreamView />;
      case 'telemetry':    return <TelemetryView />;
      case 'data-explorer': return <DataExplorerView />;
      case 'performance':  return <PerformanceView />;
      case 'scripts':      return <ScriptsView showToast={showToast} />;
      case 'snapshots':    return <SnapshotView />;
      case 'settings':     return <SettingsView showToast={showToast} onApiCheck={checkApi} />;
      default:             return <DashboardView onNewExperiment={() => setIsModalOpen(true)} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--off-white)', overflow: 'hidden' }}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewExperiment={() => setIsModalOpen(true)}
      />

      <div style={{
        marginLeft: 'var(--sidebar-w)',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minWidth: 0,
      }}>
        <Header
          isSimulating={isSimulating}
          apiConnected={apiConnected}
          onSearch={handleSearch}
          searchQuery={searchQuery}
        />

        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {renderView()}
        </div>
      </div>

      <NewExperimentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStart={handleStartExperiment}
      />

      {/* Toast notifications */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 300, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.type === 'success' ? '✓ ' : t.type === 'error' ? '✕ ' : ''}
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}

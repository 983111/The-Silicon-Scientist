import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArtifactRenderer } from './ArtifactRenderer';

function getWorkerUrl() {
  return localStorage.getItem('silicon-worker-url') || (import.meta as any).env?.VITE_WORKER_URL || '';
}

interface Phase {
  phase: string;
  iteration?: number;
  hypothesis?: string;
  new_hypothesis?: string;
  script?: string;
  stdout?: string;
  metrics?: { success_rate: number; confidence: number; key_finding: string };
  analysis?: string;
  anomalies?: string[];
  passed?: boolean;
  failure_reason?: string;
  correction?: string;
  tool_calls?: { name: string; desc: string; status: string }[];
  final_hypothesis?: string;
  confidence?: number;
  summary?: string;
  success?: boolean;
  next_steps?: string[];
  rationale?: string;
}

interface LogEntry {
  time: string;
  level: string;
  msg: string;
}

const DEFAULT_PLOT = [
  { iteration: 1, metric: 45 }, { iteration: 2, metric: 52 }, { iteration: 3, metric: 65 },
  { iteration: 4, metric: 78 }, { iteration: 5, metric: 88 },
];

const LOOP_STEPS = ['Write Script', 'Execute', 'Analyze', 'Self-Correct'];

function syntaxHighlight(line: string): React.ReactNode {
  if (line.trim().startsWith('#')) return <span className="cm">{line}</span>;
  const parts: React.ReactNode[] = [];
  const regex = /(\b(?:import|from|def|class|return|if|elif|else|for|while|try|except|with|as|True|False|None|and|or|not|in|is|lambda|yield|pass|break|continue|raise|global|nonlocal|async|await)\b)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d+\.?\d*(?:e[+-]?\d+)?\b)|(\b[A-Z][a-zA-Z0-9_]*\s*\()/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(line)) !== null) {
    if (m.index > last) parts.push(<span key={last}>{line.slice(last, m.index)}</span>);
    if (m[1]) parts.push(<span key={m.index} className="kw">{m[1]}</span>);
    else if (m[2]) parts.push(<span key={m.index} className="str">{m[2]}</span>);
    else if (m[3]) parts.push(<span key={m.index} className="num">{m[3]}</span>);
    else if (m[4]) parts.push(<span key={m.index} className="fn">{m[4]}</span>);
    last = m.index + m[0].length;
  }
  if (last < line.length) parts.push(<span key={last}>{line.slice(last)}</span>);
  return <>{parts}</>;
}

function getLogClass(level: string) {
  switch (level) {
    case 'ERROR': return 'log-error';
    case 'WARN': return 'log-warn';
    case 'EXEC': return 'log-exec';
    case 'DATA': return 'log-data';
    default: return 'log-info';
  }
}

export function WorkspaceView() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [loopStep, setLoopStep] = useState(0);
  const [iteration, setIteration] = useState(0);
  const [maxIterations, setMaxIterations] = useState(5);
  const [hypothesis, setHypothesis] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([
    { time: '00:00:00', level: 'INFO', msg: 'Silicon Scientist kernel ready. Click "New Experiment" to begin.' }
  ]);
  const [activeTab, setActiveTab] = useState<'code' | 'console' | 'plot' | 'artifact'>('code');
  const [currentScript, setCurrentScript] = useState('');
  const [currentStdout, setCurrentStdout] = useState('');
  const [currentArtifact, setCurrentArtifact] = useState<{ type: string; content: string; iteration: number } | undefined>();
  const [plotData, setPlotData] = useState(DEFAULT_PLOT);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [conclusion, setConclusion] = useState<Phase | null>(null);
  const [metrics, setMetrics] = useState({ success_rate: 0, confidence: 0, key_finding: '' });
  const [experimentProblem, setExperimentProblem] = useState('');
  const [toolCalls, setToolCalls] = useState<{ name: string; desc: string; status: string }[]>([]);

  const logsEndRef = useRef<HTMLDivElement>(null);

  const now = () => new Date().toLocaleTimeString('en-US', { hour12: false });

  const addLog = useCallback((level: string, msg: string) => {
    setLogs(prev => [...prev.slice(-200), { time: now(), level, msg }]);
  }, []);

  useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

  useEffect(() => {
    const handler = (e: CustomEvent) => startExperiment(e.detail);
    window.addEventListener('silicon:start-experiment', handler as EventListener);
    return () => window.removeEventListener('silicon:start-experiment', handler as EventListener);
  }, []);

  const startExperiment = useCallback((data: any) => {
    const WORKER_URL = getWorkerUrl();
    if (!WORKER_URL) {
      addLog('ERROR', 'No Worker URL configured. Go to Settings to set your Cloudflare Worker URL.');
      return;
    }

    setExperimentProblem(data.problem || '');
    setIsSimulating(true);
    setLoopStep(1);
    setIteration(1);
    setMaxIterations(data.iterations || 5);
    setPhases([]);
    setConclusion(null);
    setCurrentScript('');
    setCurrentStdout('');
    setCurrentArtifact(undefined);
    setPlotData([]);
    setHypothesis('Initializing autonomous research loop...');
    setToolCalls([]);
    setMetrics({ success_rate: 0, confidence: 0, key_finding: '' });
    setLogs([{ time: now(), level: 'INFO', msg: `Experiment started. Problem: ${(data.problem || '').slice(0, 80)}...` }]);

    fetch(`${WORKER_URL}/api/experiment/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(async res => {
        if (!res.ok || !res.body) {
          addLog('ERROR', `Worker returned ${res.status}. Check your Worker URL in Settings.`);
          setIsSimulating(false);
          setLoopStep(0);
          window.dispatchEvent(new CustomEvent('silicon:simulation-ended'));
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        const dispatch = (event: string, payload: any) => {
          switch (event) {
            case 'start':
              addLog('INFO', `K2 connected. Running autonomous loop...`);
              break;
            case 'artifact':
              setCurrentArtifact(payload);
              setActiveTab('artifact');
              addLog('INFO', `[Iter ${payload.iteration}] Generated ${payload.type} visual artifact.`);
              break;
            case 'phase':
              handlePhase(payload as Phase);
              break;
            case 'thinking':
              addLog('INFO', payload.content?.slice(0, 120) || '');
              break;
            case 'complete':
              setIsSimulating(false);
              setLoopStep(0);
              addLog('INFO', payload.status === 'finished'
                ? `✓ Research loop complete after ${payload.iterations} iterations.`
                : 'Loop ended: max phases reached.');
              window.dispatchEvent(new CustomEvent('silicon:simulation-ended'));
              break;
            case 'error':
              addLog('ERROR', payload.message || 'Unknown error from K2 API');
              setIsSimulating(false);
              setLoopStep(0);
              window.dispatchEvent(new CustomEvent('silicon:simulation-ended'));
              break;
          }
        };

        const handlePhase = (phase: Phase) => {
          setPhases(prev => [...prev, phase]);
          switch (phase.phase) {
            case 'WRITE_SCRIPT':
              setLoopStep(1);
              setIteration(phase.iteration || 1);
              if (phase.hypothesis) setHypothesis(phase.hypothesis);
              if (phase.script) setCurrentScript(phase.script);
              setActiveTab('code');
              addLog('EXEC', `[Iter ${phase.iteration}] Writing simulation script...`);
              break;
            case 'EXECUTE_SCRIPT':
              setLoopStep(2);
              if (phase.stdout) setCurrentStdout(phase.stdout);
              setActiveTab('console');
              addLog('INFO', `[Iter ${phase.iteration}] Executing simulation...`);
              if (phase.metrics) {
                const metrics = phase.metrics;
                setMetrics({ success_rate: metrics.success_rate, confidence: metrics.confidence, key_finding: metrics.key_finding });
                addLog('DATA', `Finding: ${metrics.key_finding}`);
                setPlotData(prev => [...prev, { iteration: phase.iteration || 1, metric: metrics.success_rate }]);
              }
              break;
            case 'ANALYZE_RESULTS':
              setLoopStep(3);
              setActiveTab('plot');
              addLog('INFO', `[Iter ${phase.iteration}] Analyzing results — ${phase.passed ? 'PASS' : 'FAIL'}`);
              if (phase.tool_calls) {
                setToolCalls(prev => [...prev, ...phase.tool_calls!]);
                phase.tool_calls.forEach(tc => addLog(tc.status === 'OK' ? 'EXEC' : 'ERROR', `${tc.name}: ${tc.desc}`));
              }
              break;
            case 'CORRECT_HYPOTHESIS':
              setLoopStep(4);
              if (phase.new_hypothesis) setHypothesis(phase.new_hypothesis);
              addLog('WARN', `[Iter ${phase.iteration}] Failure: ${(phase.failure_reason || '').slice(0, 100)}`);
              addLog('INFO', `Self-correcting: ${(phase.correction || '').slice(0, 100)}`);
              break;
            case 'CONCLUSION':
              setLoopStep(0);
              setConclusion(phase);
              if (phase.final_hypothesis) setHypothesis(phase.final_hypothesis);
              addLog('INFO', `Concluded [Iter ${phase.iteration}]: ${phase.success ? 'SUCCESS' : 'BEST EFFORT'} — Confidence ${((phase.confidence || 0) * 100).toFixed(0)}%`);
              setIsSimulating(false);
              window.dispatchEvent(new CustomEvent('silicon:simulation-ended'));
              break;
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          let eventName = '', dataLine = '';
          for (const line of lines) {
            if (line.startsWith('event: ')) eventName = line.slice(7).trim();
            else if (line.startsWith('data: ')) dataLine = line.slice(6).trim();
            else if (line === '' && eventName && dataLine) {
              try { dispatch(eventName, JSON.parse(dataLine)); } catch {}
              eventName = ''; dataLine = '';
            }
          }
        }
        setIsSimulating(false);
        setLoopStep(0);
        window.dispatchEvent(new CustomEvent('silicon:simulation-ended'));
      })
      .catch(err => {
        addLog('ERROR', `Connection failed: ${err.message}. Check your Worker URL in Settings.`);
        setIsSimulating(false);
        setLoopStep(0);
        window.dispatchEvent(new CustomEvent('silicon:simulation-ended'));
      });
  }, [addLog]);

  const stopSimulation = () => {
    setIsSimulating(false);
    setLoopStep(0);
    addLog('WARN', 'Research loop halted by user.');
    window.dispatchEvent(new CustomEvent('silicon:simulation-ended'));
  };

  const openModal = () => window.dispatchEvent(new CustomEvent('silicon:open-modal'));

  const progressPct = maxIterations > 0 ? Math.round((iteration / maxIterations) * 100) : 0;

  return (
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '320px 1fr', gap: 0, overflow: 'hidden', height: '100%' }}>
      {/* Left: Agent Reasoning Panel */}
      <div style={{ borderRight: '1px solid var(--rule)', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--white)' }}>
        {/* Header */}
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--rule)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
              Agent Reasoning
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {isSimulating && <span className="pulse" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-sage)', display: 'inline-block' }} />}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-muted)' }}>
                {iteration > 0 ? `Iter ${iteration}/${maxIterations}` : 'Idle'}
              </span>
            </div>
          </div>
          {/* Progress bar */}
          {maxIterations > 0 && iteration > 0 && (
            <div style={{ marginTop: 10 }}>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 10, color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>{progressPct}% complete</span>
                <span style={{ fontSize: 10, color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>{iteration}/{maxIterations}</span>
              </div>
            </div>
          )}
        </div>

        <div className="scroll-area" style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }}>
          {/* Problem */}
          {experimentProblem && (
            <div style={{ marginBottom: 16, padding: '10px 12px', background: 'var(--paper)', borderRadius: 'var(--radius-md)', border: '1px solid var(--rule-light)' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Problem</div>
              <p style={{ fontSize: 12.5, color: 'var(--ink-mid)', margin: 0, lineHeight: 1.5 }}>{experimentProblem}</p>
            </div>
          )}

          {/* Current Hypothesis */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              Current Hypothesis
            </div>
            <p style={{
              fontSize: 13, lineHeight: 1.6, margin: 0,
              color: hypothesis ? 'var(--ink)' : 'var(--ink-muted)',
              fontStyle: hypothesis ? 'normal' : 'italic',
              borderLeft: '2px solid var(--accent)',
              paddingLeft: 10,
            }}>
              {hypothesis || 'No experiment running. Start one to see the hypothesis evolve.'}
            </p>
          </div>

          {/* Conclusion */}
          {conclusion && (
            <div style={{
              marginBottom: 16, padding: '12px',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${conclusion.success ? 'var(--sage-mid)' : 'var(--gold-mid)'}`,
              background: conclusion.success ? 'var(--sage-light)' : 'var(--gold-light)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: conclusion.success ? 'var(--accent-sage)' : 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                {conclusion.success ? '✓ Hypothesis Validated' : '⚠ Best Effort Result'}
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--ink-mid)', margin: '0 0 8px', lineHeight: 1.5 }}>{conclusion.summary}</p>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-muted)' }}>
                Confidence: {((conclusion.confidence || 0) * 100).toFixed(0)}%
              </div>
              {conclusion.next_steps && conclusion.next_steps.length > 0 && (
                <div style={{ marginTop: 8, borderTop: `1px solid ${conclusion.success ? 'var(--sage-mid)' : 'var(--gold-mid)'}`, paddingTop: 8 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Next Steps</div>
                  {conclusion.next_steps.slice(0, 3).map((s, i) => (
                    <div key={i} style={{ fontSize: 12, color: 'var(--ink-mid)', marginBottom: 2 }}>→ {s}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Metrics */}
          {metrics.success_rate > 0 && (
            <div style={{ marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'Success Rate', value: `${metrics.success_rate.toFixed(1)}%`, color: 'var(--accent-sage)' },
                { label: 'Confidence', value: metrics.confidence.toFixed(2), color: 'var(--accent)' },
              ].map((m, i) => (
                <div key={i} style={{ padding: '10px 12px', background: 'var(--paper)', borderRadius: 'var(--radius-md)', border: '1px solid var(--rule-light)' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{m.label}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 500, color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>
          )}
          {metrics.key_finding && (
            <div style={{ marginBottom: 16, padding: '8px 10px', background: 'var(--paper)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--ink-mid)', lineHeight: 1.5, fontStyle: 'italic', border: '1px solid var(--rule-light)' }}>
              "{metrics.key_finding}"
            </div>
          )}

          {/* Loop steps */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              Autonomous Loop
            </div>
            {LOOP_STEPS.map((step, i) => {
              const stepNum = i + 1;
              const isActive = loopStep === stepNum;
              const isDone = isSimulating ? loopStep > stepNum : (conclusion && !isSimulating);
              return (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: i < LOOP_STEPS.length - 1 ? 12 : 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      border: `2px solid ${isActive ? 'var(--accent)' : isDone ? 'var(--accent-sage)' : 'var(--rule)'}`,
                      background: isActive ? 'var(--accent)' : isDone ? 'var(--sage-light)' : 'var(--white)',
                      color: isActive ? 'var(--white)' : isDone ? 'var(--accent-sage)' : 'var(--ink-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 500,
                      transition: 'all 0.3s ease',
                      boxShadow: isActive ? '0 0 0 4px var(--accent-light)' : 'none',
                    }}>
                      {isDone && !isActive ? '✓' : stepNum.toString().padStart(2, '0')}
                    </div>
                    {i < LOOP_STEPS.length - 1 && (
                      <div style={{ width: 1, height: 20, background: isDone ? 'var(--accent-mid)' : 'var(--rule-light)', marginTop: 2 }} />
                    )}
                  </div>
                  <div style={{ paddingTop: 2, flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: isActive ? 'var(--accent)' : isDone ? 'var(--accent-sage)' : 'var(--ink-muted)', marginBottom: 2, transition: 'color 0.3s' }}>
                      {step}
                    </div>
                    {isActive && isSimulating && (
                      <div style={{ fontSize: 11, color: 'var(--ink-muted)', fontStyle: 'italic' }}>
                        {stepNum === 1 && 'K2 formulating hypothesis & writing code...'}
                        {stepNum === 2 && 'Executing on Piston engine, collecting output...'}
                        {stepNum === 3 && 'Analyzing results, extracting key findings...'}
                        {stepNum === 4 && 'Self-correcting — refining hypothesis...'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Phase history */}
          {phases.length > 0 && (
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                Phase History
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {phases.slice(-8).map((p, i) => {
                  const color = p.phase === 'CONCLUSION' ? (p.success ? 'var(--accent-sage)' : 'var(--accent-gold)') :
                    p.phase === 'CORRECT_HYPOTHESIS' ? 'var(--accent)' :
                    p.phase === 'WRITE_SCRIPT' ? 'var(--accent-slate)' :
                    'var(--ink-muted)';
                  return (
                    <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-muted)' }}>
                        [{p.iteration}] {p.phase}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action button */}
        <div style={{ padding: '12px 18px', borderTop: '1px solid var(--rule)', flexShrink: 0 }}>
          {isSimulating ? (
            <button className="btn-primary danger" style={{ width: '100%', justifyContent: 'center' }} onClick={stopSimulation}>
              Halt Research Loop
            </button>
          ) : (
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={openModal}>
              New Experiment
            </button>
          )}
        </div>
      </div>

      {/* Right: Terminal + Code */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--off-white)' }}>
        {/* Loop status bar */}
        <div style={{ padding: '12px 20px', background: 'var(--white)', borderBottom: '1px solid var(--rule)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {LOOP_STEPS.map((step, i) => (
              <React.Fragment key={i}>
                <div className={`loop-step ${loopStep === i + 1 ? 'active' : (loopStep > i + 1 || (conclusion && !isSimulating)) ? 'done' : ''}`}>
                  <div className="loop-step-num">
                    {(loopStep > i + 1 || (conclusion && !isSimulating)) ? '✓' : (i + 1).toString().padStart(2, '0')}
                  </div>
                  <div className="loop-step-label">{step}</div>
                </div>
                {i < LOOP_STEPS.length - 1 && (
                  <div className={`loop-connector ${loopStep > i + 1 ? 'filled' : ''}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Terminal */}
        <div className="terminal" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Terminal tabs */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderBottom: '1px solid #1e1d1b', background: '#0a0908', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#c0392b' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#b8922a' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#3a6b5a' }} />
              </div>
              <div style={{ width: 1, height: 14, background: '#2a2825' }} />
              {(['code', 'console', 'plot', 'artifact'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '3px 10px', borderRadius: 4, border: 'none',
                    background: activeTab === tab ? '#1e1d1b' : 'transparent',
                    color: activeTab === tab ? (tab === 'code' ? '#d4512a' : tab === 'console' ? '#3a6b5a' : tab === 'artifact' ? '#8e44ad' : '#2d4a6e') : '#4a4540',
                    fontSize: 11.5, fontFamily: 'var(--font-mono)', cursor: 'pointer', fontWeight: 500,
                  }}
                >
                  {tab === 'code' ? 'agent_script.py' : tab === 'console' ? 'exec_output.log' : tab === 'plot' ? 'metrics_plot' : 'visual_artifact'}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: '#4a4540' }}>K2-Think-v2</span>
              {isSimulating && <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: '#3a6b5a' }} className="pulse">● LIVE</span>}
            </div>
          </div>

          {/* Tab content */}
          <div className="scroll-area" style={{ flex: 1, overflow: 'auto' }}>
            {activeTab === 'code' && (
              <div style={{ padding: '16px 0' }}>
                {currentScript ? (
                  currentScript.split('\n').map((line, i) => (
                    <div key={i} style={{ display: 'flex', gap: 0, padding: '0 16px', minHeight: '1.7em' }}>
                      <span className="ln-num" style={{ minWidth: '2.5rem', paddingRight: 16, fontFamily: 'var(--font-mono)', fontSize: 12 }}>{i + 1}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                        {syntaxHighlight(line)}
                      </span>
                    </div>
                  ))
                ) : (
                  <>
                    {['# Silicon Scientist — Awaiting experiment initialization', '# Start a new experiment to see K2-generated research scripts.', '', 'import json', 'import numpy as np', '# K2 will write a custom script for your research problem here.', '# ...'].map((line, i) => (
                      <div key={i} style={{ display: 'flex', gap: 0, padding: '0 16px', minHeight: '1.7em' }}>
                        <span className="ln-num" style={{ minWidth: '2.5rem', paddingRight: 16, fontFamily: 'var(--font-mono)', fontSize: 12 }}>{i + 1}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, whiteSpace: 'pre-wrap' }}>
                          {syntaxHighlight(line)}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {activeTab === 'console' && (
              <div style={{ padding: '16px' }}>
                {logs.map((log, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 3, alignItems: 'flex-start', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                    <span className="log-time" style={{ flexShrink: 0 }}>[{log.time}]</span>
                    <span className={getLogClass(log.level)} style={{ flexShrink: 0 }}>{log.level}:</span>
                    <span style={{ color: '#9a9590', wordBreak: 'break-word' }}>{log.msg}</span>
                  </div>
                ))}
                {currentStdout && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #1e1d1b' }}>
                    <div style={{ fontSize: 10.5, color: '#4a4540', marginBottom: 6, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>─── Simulation Output ───</div>
                    {currentStdout.split('\n').map((line, i) => (
                      <div key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#6b6560', marginBottom: 1 }}>{line}</div>
                    ))}
                  </div>
                )}
                {isSimulating && loopStep === 2 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 4, fontFamily: 'var(--font-mono)', fontSize: 12 }} className="pulse">
                    <span style={{ color: '#4a4540' }}>[{now()}]</span>
                    <span className="log-exec">EXEC:</span>
                    <span style={{ color: '#9a9590' }}>Running simulation...</span>
                  </div>
                )}
                <div ref={logsEndRef} />
              </div>
            )}

            {activeTab === 'plot' && (
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: '#0a0908', border: '1px solid #1e1d1b', borderRadius: 8, padding: '16px 12px' }}>
                  <div style={{ fontSize: 11, color: '#4a4540', fontFamily: 'var(--font-mono)', textAlign: 'center', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Agent Metric Performance — Iteration {iteration || '—'}
                  </div>
                  <div style={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={plotData} margin={{ top: 5, right: 16, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3a6b5a" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#3a6b5a" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="2 2" stroke="#1e1d1b" />
                        <XAxis dataKey="iteration" stroke="#4a4540" fontSize={10} tickLine={false} axisLine={false} tick={{ fontFamily: 'DM Mono' }} label={{ value: 'Iteration', position: 'insideBottom', fill: '#4a4540', fontSize: 10, fontFamily: 'DM Mono', dy: 10 }} />
                        <YAxis stroke="#4a4540" fontSize={10} tickLine={false} axisLine={false} tick={{ fontFamily: 'DM Mono' }} />
                        <Tooltip contentStyle={{ background: '#0F0E0D', border: '1px solid #1e1d1b', borderRadius: 6, fontSize: 12, fontFamily: 'DM Mono' }} itemStyle={{ color: '#3a6b5a' }} />
                        <Area type="monotone" dataKey="metric" stroke="#3a6b5a" strokeWidth={2} fillOpacity={1} fill="url(#metricGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Tool calls */}
                {toolCalls.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, color: '#4a4540', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Tool Executions</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {toolCalls.slice(-6).map((tc, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#0a0908', borderRadius: 6, border: '1px solid #1e1d1b' }}>
                          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: tc.status === 'OK' ? '#3a6b5a' : '#c0392b', fontWeight: 700, minWidth: 24 }}>{tc.status}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#2d4a6e', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tc.name}</span>
                          <span style={{ fontSize: 11, color: '#4a4540', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{tc.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'artifact' && (
              <div style={{ padding: '16px', height: '100%' }}>
                <ArtifactRenderer artifact={currentArtifact} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

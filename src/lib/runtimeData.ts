export type ExperimentStatus = 'running' | 'completed' | 'failed' | 'stopped';

export interface ToolCall {
  name: string;
  desc: string;
  status: string;
  at: string;
  iteration?: number;
}

export interface EvolutionEntry {
  iteration: number;
  at: string;
  type: 'hypothesis' | 'correction' | 'success' | 'failure' | 'tool-cascade';
  title: string;
  content: string;
  confidence?: number;
  tools?: ToolCall[];
}

export interface TelemetryPoint {
  at: string;
  iteration: number;
  successRate?: number;
  confidence?: number;
}

export interface ExperimentRun {
  id: string;
  problem: string;
  objectives?: string;
  constraints?: string;
  startedAt: string;
  endedAt?: string;
  status: ExperimentStatus;
  maxIterations: number;
  currentIteration: number;
  finalConfidence?: number;
  finalSummary?: string;
}

export interface RuntimeState {
  runs: ExperimentRun[];
  evolution: EvolutionEntry[];
  toolCalls: ToolCall[];
  activity: { at: string; type: string; msg: string }[];
  telemetry: TelemetryPoint[];
}

const STORAGE_KEY = 'silicon-runtime-state-v1';

const INITIAL_STATE: RuntimeState = {
  runs: [],
  evolution: [],
  toolCalls: [],
  activity: [],
  telemetry: [],
};

function cap<T>(arr: T[], n = 400): T[] {
  return arr.slice(Math.max(0, arr.length - n));
}

export function getRuntimeState(): RuntimeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw);
    return {
      runs: parsed.runs || [],
      evolution: parsed.evolution || [],
      toolCalls: parsed.toolCalls || [],
      activity: parsed.activity || [],
      telemetry: parsed.telemetry || [],
    };
  } catch {
    return INITIAL_STATE;
  }
}

export function updateRuntimeState(mutator: (prev: RuntimeState) => RuntimeState) {
  const next = mutator(getRuntimeState());
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('silicon:data-updated'));
}

export function startRun(payload: { problem: string; objectives?: string; constraints?: string; maxIterations: number }) {
  const run: ExperimentRun = {
    id: `EXP-${Date.now().toString().slice(-6)}`,
    problem: payload.problem,
    objectives: payload.objectives,
    constraints: payload.constraints,
    startedAt: new Date().toISOString(),
    status: 'running',
    maxIterations: payload.maxIterations,
    currentIteration: 1,
  };

  updateRuntimeState(prev => ({
    ...prev,
    runs: cap([...prev.runs, run], 100),
    activity: cap([...prev.activity, { at: run.startedAt, type: 'start', msg: `Started ${run.id}: ${run.problem}` }]),
  }));

  return run;
}

export function updateRunProgress(runId: string, fields: Partial<ExperimentRun>) {
  updateRuntimeState(prev => ({
    ...prev,
    runs: prev.runs.map(r => (r.id === runId ? { ...r, ...fields } : r)),
  }));
}

export function recordEvolution(entry: EvolutionEntry) {
  updateRuntimeState(prev => ({
    ...prev,
    evolution: cap([...prev.evolution, entry], 600),
  }));
}

export function recordToolCalls(calls: ToolCall[]) {
  updateRuntimeState(prev => ({
    ...prev,
    toolCalls: cap([...prev.toolCalls, ...calls], 1000),
    activity: cap([
      ...prev.activity,
      ...calls.map(c => ({ at: c.at, type: c.status === 'OK' ? 'tool' : 'anomaly', msg: `${c.name}: ${c.desc}` })),
    ]),
  }));
}

export function recordTelemetry(point: TelemetryPoint) {
  updateRuntimeState(prev => ({
    ...prev,
    telemetry: cap([...prev.telemetry, point], 1000),
  }));
}

export function finishRun(runId: string, status: ExperimentStatus, summary?: string, confidence?: number) {
  const at = new Date().toISOString();
  updateRuntimeState(prev => ({
    ...prev,
    runs: prev.runs.map(r =>
      r.id === runId ? { ...r, status, endedAt: at, finalSummary: summary, finalConfidence: confidence } : r,
    ),
    activity: cap([...prev.activity, { at, type: status === 'completed' ? 'complete' : 'anomaly', msg: `${runId} ${status}` }]),
  }));
}

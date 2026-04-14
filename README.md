# Silicon Scientist

**An autonomous lab‑agent web application that integrates data visualization, experiment orchestration, hypothesis evolution tracking, and tool‑chain execution.**

---

## Table of Contents
1. [Overview](#overview)  
2. [Key Features](#key-features)  
3. [Architecture & Data Flow](#architecture--data-flow)  
4. [Tech Stack](#tech-stack)  
5. [Prerequisites](#prerequisites)  
6. [Installation](#installation)  
7. [Configuration](#configuration)  
8. [Running the Development Server](#running-the-development-server)  
9. [Building for Production](#building-for-production)  
10. [Custom Events](#custom-events)  
11. [UI Navigation](#ui-navigation)  
12. [Components Overview](#components-overview)  
13. [Toasts & Notifications](#toasts--notifications)  
14. [Simulation Control](#simulation-control)  
15. [API Connectivity](#api-connectivity)  
16. [Environment Variables](#environment-variables)  
17. [Scripts & npm Tasks](#scripts--npm-tasks)  
18. [Testing](#testing)  
19. [Contributing](#contributing)  
20. [License](#license)  

---

## Overview
Silicon Scientist provides a unified, AI‑assisted interface for researchers to:

- **Design** new experiments via a modal wizard.
- **Launch** and **monitor** experiments in a real‑time lab workspace.
- **Explore** raw data with interactive charts and filters.
- **Track** hypothesis evolution, self‑correction steps, and visual snapshots.
- **Execute** tool‑chains (e.g., DFT calculations) and view their logs.
- **Access** telemetry, performance metrics, and script repository.
- **Export** data in CSV format and apply fine‑grained filters.
- **Connect** to the external K2 API for data enrichment and experiment validation.

The UI is built with **React**, **Tailwind CSS**, and **Recharts**, and runs on **Vite** for rapid development and optimized bundle size.

---

## Key Features
| Feature | Description |
|---------|-------------|
| **Dashboard** | Quick overview of key metrics, trend visualizations, performance matrix, script repository, and raw telemetry table. |
| **Lab Workspace** | Central area to launch and manage experiments with custom event‑driven start/stop simulation triggers. |
| **Data Explorer** | Interactive scatter and area charts, optimization trends, performance matrix, script preview, CSV export, and filter capabilities. |
| **Evolution Log** | Chronological view of hypothesis evolution, self‑correction steps, tool execution streams, and visual snapshots. |
| **New Experiment Modal** | Configure and start experiments via a modal accessible from multiple entry points. |
| **Simulation Control** | Real‑time simulation status indicator (running/idle) across the UI. |
| **Telemetry & Metrics** | Live kernel temperature, compute load, iterative delta, correlations, p‑values, and more. |
| **Script Repository** | List of experiment scripts with status, descriptions, and preview functionality. |
| **Export & Filter** | CSV export and filtering for raw simulation data. |
| **Search Experiments** | Header search bar for locating past experiments quickly. |
| **Tool Execution Stream** | Logs of executed tools (e.g., DFT calculations) with timestamps and status. |
| **API Connectivity Indicator** | Sidebar badge showing connection to the K2 API. |
| **Responsive Design** | Adaptive UI with sticky header and collapsible sidebar. |
| **Tailwind CSS Styling** | Consistent design using Tailwind utilities and glassmorphism effects. |
| **Recharts Integration** | Area, scatter, and line chart visualizations. |
| **Material Symbols Icons** | Clean, scalable icons for navigation and actions. |
| **Custom Scrollbars** | Smooth scrolling with styled overflow containers. |
| **Event‑Driven Architecture** | Uses CustomEvents (`silicon:open-modal`, `silicon:start-experiment`, `silicon:simulation-ended`). |
| **Status Badges & Tags** | Color‑coded experiment states (STABLE, BONDING, REJECTED). |
| **Visual Overlays** | Data grid masks, blur effects, and hover animations. |
| **Snapshot Viewer** | Embedded image viewer with fullscreen support. |

---

## Architecture & Data Flow
┌───────────────────────────────────────┐
│               Browser UI               │
│  (React + Tailwind + Recharts)          │
│                                         │
│  ┌─────────────┐   ┌─────────────────┐ │
│  │   Sidebar   │   │    Header       │ │
│  └─────┬───────┘   └───────┬─────────┘ │
│        │                 │         │
│        ▼                 ▼         │
│   ┌─────────────────────────────────┐ │
│   │          Main Layout             │ │
│   │  ┌─────────────┐   ┌─────────────┐│ │
│   │  │  NewExpModal│   │  ToastBox   ││ │
│   │  └─────┬───────┘   └───────┬─────┘│ │
│   │        │                 │     │ │
│   │        ▼                 ▼     │ │
│   │   ┌─────────────────────────────┐│ │
│   │   │   Dynamic View (based on tab)││ │
│   │   │  (DashboardView, WorkspaceView,││ │
│   │   │   DataExplorerView, …)       ││ │
│   │   └─────────────────────────────┘│ │
│   └─────────────────────────────────┘ │
│               ▲                       │
│               │                       │
│   ┌─────────────────────────────────┐ │
│   │      Worker Service (WebWorker) │ │
│   │  – Handles long‑running simulation│ │
│   │  – Exposes `/api/health` endpoint │ │
│   └─────────────────────────────────┘ │
│               ▲                       │
│               │                       │
│   ┌─────────────────────────────────┐ │
│   │          K2 API (REST)           │ │
│   └─────────────────────────────────┘ │
└───────────────────────────────────────┘
- **React UI** dispatches **CustomEvents** to request modal opening, experiment start, navigation, settings changes, etc.
- **Worker Service** (in `worker.js`) runs heavy computation in a separate thread, exposing a health endpoint used by the UI to verify connectivity.
- **K2 API** is contacted for experiment validation, data enrichment, and telemetry aggregation.

---

## Tech Stack
| Layer | Technology |
|-------|------------|
| **Framework** | React 18 |
| **Bundler** | Vite |
| **Styling** | Tailwind CSS, Glassmorphism utilities |
| **Charts** | Recharts |
| **Icons** | Material Symbols |
| **State** | React `useState` / `useEffect` (no external state lib) |
| **Networking** | Fetch API, AbortSignal timeout |
| **Workers** | Web Worker (`worker.js`) |
| **Build Tools** | npm scripts, tsconfig.json |
| **Testing** | (Add your testing framework) |
| **Lint/Format** | (Add ESLint/Prettier if used) |

---

## Prerequisites
- **Node.js** – v18 or later (recommended v20)
- **npm** – v9 or later (or `pnpm` / `yarn` if you prefer)
- **Git** – optional but recommended for version control

---

## Installation
# Clone the repository
git clone https://github.com/983111/The-Silicon-Scientist.git
cd The-Silicon-Scientist

# Install dependencies
npm install   # or `pnpm install` / `yarn`

# (Optional) Install dev dependencies for linting/formatting
npm install -D

---

## Configuration
### Settings UI
- Access via the **Settings** tab in the sidebar.
- You can override the worker URL, enable/disable API connectivity, and adjust UI preferences.
- Changes trigger a `silicon:settings-changed` event, which forces the app to re‑validate API connectivity.

### Environment Variables
- **VITE_WORKER_URL** – Base URL for the worker service.  
  Set in a `.env` file (`.env.development`, `.env.production`, etc.) or via the Vite config.
- **Other variables** – Add them to `.env.example` and reference them using `import.meta.env.VITE_...`.

### LocalStorage Override
- The app reads `localStorage.getItem('silicon-worker-url')` first, allowing you to pin a specific worker URL at runtime.

---

## Running the Development Server
npm run dev
# Vite will start at http://localhost:5173 (or the URL shown in the console)

- Hot‑module replacement (HMR) works for both TypeScript and CSS.
- The server also serves the `worker.js` file (if placed under `public/` or compiled).

### Live Reload of Worker (Optional)
If you modify `worker.js`, stop the dev server and restart it so the new worker script is fetched.

---

## Building for Production
npm run build
# Artifacts are placed in the `dist/` folder

- Vite bundles assets with **esbuild** and **rollup**, producing minified JavaScript and CSS.
- Deploy the contents of `dist/` to any static host (Netlify, Vercel, Cloudflare Pages, etc.).

### Preview Build
npm run preview
# Serves the production build locally for sanity checks

---

## Custom Events
Silicon Scientist communicates via **CustomEvents** on the `window` object. Below is the complete list:

| Event Name | Payload (`detail`) | Triggered By |
|------------|--------------------|--------------|
| `silicon:open-modal` | `null` | Clicking “New Experiment” button in Sidebar or Dashboard |
| `silicon:start-experiment` | `{ experimentConfig }` (any) | User submits the NewExperimentModal |
| `silicon:simulation-ended` | `null` | WorkspaceView finishes a simulation |
| `silicon:settings-changed` | `null` | SettingsView saves a new configuration |
| `silicon:nav` | `string` (tab identifier) | Sidebar navigation click or programmatic navigation |
| `silicon:search` | `string` (search query) | Header search input (`onSearch` handler) |

> **Note:** All events are **non‑blocking**. UI state is updated synchronously after dispatching.

---

## UI Navigation
The **Sidebar** includes the following tabs (keys match the `activeTab` state value):

| Tab | Component | Description |
|-----|-----------|-------------|
| `dashboard` | `DashboardView` | Overview page with key metrics, script repo, telemetry table |
| `workspace` | `WorkspaceView` | Central area for launching and managing experiments |
| `evolution-log` | `EvolutionLogView` | Chronological log of hypothesis evolution |
| `tool-stream` | `ToolStreamView` | Logs of executed tools (e.g., DFT calculations) |
| `telemetry` | `TelemetryView` | Live telemetry and system metrics |
| `data-explorer` | `DataExplorerView` | Interactive data visualizations and filters |
| `performance` | `PerformanceView` | Performance matrix and optimization trends |
| `scripts` | `ScriptsView` | Script repository with preview and status |
| `snapshots` | `SnapshotView` | Embedded image viewer for experiment snapshots |
| `settings` | `SettingsView` | Application settings and API health check |

Navigating changes `activeTab` which drives the `renderView` switch statement in `src/App.tsx`.

---

## Components Overview
### `src/components/Sidebar.tsx`
- Renders navigation links.
- Shows API connectivity badge.
- Emits `silicon:open-modal` when “New Experiment” is clicked.

### `src/components/Header.tsx`
- Displays simulation status (`isSimulating`).
- Shows API connection state (`apiConnected`).
- Search input triggers `silicon:search` events.

### `src/components/DashboardView.tsx`
- High‑level summary of experiments.
- Calls `onNewExperiment` to open the modal.
- Notifies navigation via `onNavigate`.

### `src/components/WorkspaceView.tsx`
- Core experiment controller.
- Listens for `silicon:start-experiment`, runs simulation, then dispatches `silicon:simulation-ended`.

### `src/components/DataExplorerView.tsx`
- Interactive charts using Recharts.
- Supports CSV export and data filtering.

### `src/components/EvolutionLogView.tsx`
- Timeline of hypothesis evolution.
- Shows visual snapshots (via `<SnapshotView />`).

### `src/components/TelemetryView.tsx`
- Live telemetry table and graphs.

### `src/components/ToolStreamView.tsx`
- Log stream of tool executions with timestamps.

### `src/components/PerformanceView.tsx`
- Performance matrix and optimization trends.

### `src/components/ScriptsView.tsx`
- Script repository UI.
- Receives `showToast` prop to display notifications.

### `src/components/SnapshotView.tsx`
- Embedded image viewer with fullscreen toggle.

### `src/components/SettingsView.tsx`
- UI for toggling settings.
- Calls `onApiCheck` (wrapped `checkApi`) to refresh API connectivity.

### `src/components/NewExperimentModal.tsx`
- Wizard UI for creating new experiments.
- Accepts `isOpen`, `onClose`, and `onStart` callbacks.
- Emits `silicon:start-experiment` via `handleStartExperiment`.

### `src/components/TelemetryView.tsx`, `ToolStreamView.tsx`, etc.
- Each component follows the same Tailwind‑styled layout pattern.

---

## Toasts & Notifications
- Managed centrally in `App` using a `Toast` interface (`id`, `message`, `type`).
- Types: `'success'`, `'error'`, `'info'`.
- Toast lifetime: auto‑dismiss after **3 seconds**.
- `showToast` is passed down to `ScriptsView` and `SettingsView` for user feedback.

---

## Simulation Control
- **State** (`isSimulating`) is stored in the root `App` component.
- Triggered by:
  - `silicon:start-experiment` → sets `true`.
  - `silicon:simulation-ended` → sets `false`.
- UI elements (e.g., Header badge) reflect this state instantly.

---

## API Connectivity
- The app periodically polls the worker’s `/api/health` endpoint every **30 seconds**.
- Connectivity state (`apiConnected`) is stored as `boolean | null`:
  - `null` – initial state (not yet checked).
  - `true` – healthy.
  - `false` – unreachable or unhealthy.
- The **Sidebar** shows a status badge based on this value.

**Health request example (in `App.tsx`):**
const res = await fetch(`${url}/api/health`, {
  method: 'GET',
  signal: AbortSignal.timeout(5000),
});
setApiConnected(res.ok);

---

## Environment Variables
| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_WORKER_URL` | `` (empty) | Base URL of the worker service (overridden by `localStorage`). |
| `VITE_API_URL` (if added) | `` | Optional direct API endpoint for external services. |

**Creating a custom `.env` file:**
# .env.development
VITE_WORKER_URL="http://localhost:8080"

# .env.production
VITE_WORKER_URL="https://workers.example.com"

Make sure to add any new variables to `.env.example` for documentation.

---

## Scripts & npm Tasks
| Script | Description |
|--------|-------------|
| `npm run dev` | Starts Vite dev server (`vite`). |
| `npm run build` | Produces production bundle (`vite build`). |
| `npm run preview` | Serves the production build locally (`vite preview`). |
| `npm run lint` *(if configured)* | Runs ESLint over source files. |
| `npm run format` *(if configured)* | Runs Prettier over source files. |
| `npm run test` *(if configured)* | Executes test suite (e.g., Jest, Vitest). |

---

## Testing
- The project currently does not ship a test suite. Add **Vitest** or **Jest** with **React Testing Library** as needed.
- Example test file structure: `src/__tests__/components/*.test.tsx`.

---

## Contributing
1. **Fork** the repository.
2. **Clone** your fork and install dependencies.
3. **Create** a feature branch (`git checkout -b feat/awesome-feature`).
4. **Implement** changes adhering to the existing code style (Tailwind, functional components, TypeScript).
5. **Run** `npm run lint` and `npm run format` (if applicable).
6. **Commit** with clear messages (`git commit -m "feat: add X"`).
7. **Open a Pull Request** with a concise description and screenshots if UI changes.

### Code Style Guidelines
- Use **functional components** with hooks.
- Keep components **stateless**; manage state in `App` or dedicated context.
- Follow **Tailwind utility‑first** conventions (`className="bg-gray-100 rounded-lg"` etc.).
- Prefer **`const`** and **`let`** over `var`.
- Type all props and state with TypeScript.
- Avoid magic numbers; extract them as constants or Tailwind variables.

---

## License
Silicon Scientist is licensed under the **MIT License**. See the `LICENSE` file for details.

---

## Acknowledgments
- **Recharts** – for declarative chart components.
- **Tailwind CSS** – for rapid, responsive UI styling.
- **Vite** – for fast bundling and HMR.
- **Material Symbols** – for scalable icons.
- **K2 API** – external service providing experiment validation and data enrichment.

---

*Happy experimenting!* 🚀
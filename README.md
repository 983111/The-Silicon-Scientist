# Silicon Scientist

## Overview
Silicon Scientist is an autonomous lab-agent web application that integrates data visualization, experiment orchestration, hypothesis evolution tracking, and tool-chain execution. It provides a unified interface for researchers to design, run, monitor, and analyze scientific experiments in an AI-assisted environment.

---

## Core Features

| Feature | Description |
|--------|------------|
| **Dashboard** | Quick overview of key metrics, trend visualizations, performance matrix, script repository, and raw telemetry table. |
| **Lab Workspace** | Central area to launch and manage experiments with custom event-driven start/stop simulation triggers. |
| **Data Explorer** | Interactive scatter and area charts, optimization trends, performance matrix, script preview, and export/filter capabilities. |
| **Evolution Log** | Chronological view of hypothesis evolution, self-correction steps, tool-execution streams, and visual snapshots. |
| **New Experiment Modal** | Configure and start experiments via modal accessible from multiple entry points. |
| **Simulation Control** | Real-time simulation status indicator (running/idle) across the UI. |
| **Telemetry & Metrics** | Live kernel temperature, compute load, iterative delta, correlations, p-values, and more. |
| **Script Repository** | List of experiment scripts with status, descriptions, and preview functionality. |
| **Export & Filter** | CSV export and filtering for raw simulation data. |
| **Search Experiments** | Header search bar for locating past experiments quickly. |
| **Tool Execution Stream** | Logs of executed tools (e.g., DFT calculations) with timestamps and status. |
| **API Connectivity** | Sidebar indicator showing connection to the K2 API. |
| **Responsive Design** | Adaptive UI with sticky header and collapsible sidebar. |
| **Tailwind CSS Styling** | Consistent design using Tailwind utilities and glassmorphism effects. |
| **Recharts Integration** | Area, scatter, and line chart visualizations. |
| **Material Symbols Icons** | Clean, scalable icons for navigation and actions. |
| **Custom Scrollbars** | Smooth scrolling with styled overflow containers. |
| **Event-Driven Architecture** | Uses CustomEvents (`silicon:open-modal`, `silicon:start-experiment`, `silicon:simulation-ended`). |
| **Status Badges & Tags** | Color-coded experiment states (STABLE, BONDING, REJECTED). |
| **Visual Overlays** | Data grid masks, blur effects, and hover animations. |
| **Snapshot Viewer** | Embedded image viewer with fullscreen support. |

---

## Getting Started

### Prerequisites
- Node.js (v18 or later recommended)

### Installation
```bash
npm install

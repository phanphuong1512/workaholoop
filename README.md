<div align="center">
    <h1>🔄 WORKAHOLOOP (WLP)</h1>
    <h3><em>The Loop Engineer — Spec-Driven Auto-Loop Architecture</em></h3>
</div>

<p align="center">
    <strong>An ultra-powerful AI Agent framework combining Spec-Driven Development, Parallel Subagents, and Git Worktrees to deliver high-quality software with zero hallucination.</strong>
</p>

<p align="center">
    <a href="https://github.com/workaholoop/wlp"><img src="https://img.shields.io/npm/v/@workaholoop/cli?color=blue&label=version" alt="Latest Release"/></a>
    <a href="https://github.com/workaholoop/wlp/blob/main/LICENSE"><img src="https://img.shields.io/github/license/workaholoop/wlp" alt="License"/></a>
    <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen" alt="Node.js Version"/></a>
</p>

---

## 📖 Table of Contents

- [🤔 What is Workaholoop?](#-what-is-workaholoop)
- [✨ Core Philosophy & V3 Features](#-core-philosophy--v3-features)
- [⚡ Quick Start](#-quick-start)
- [🔄 The 4-Step Auto-Loop](#-the-4-step-auto-loop)
- [🗂️ Workspace Architecture](#️-workspace-architecture)
- [🧠 Advanced: Learned Memory](#-advanced-learned-memory)
- [🛡️ Advanced: Anti-Conflict Spec](#️-advanced-anti-conflict-spec)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🤔 What is Workaholoop?

**Workaholoop (WLP)** flips the script on traditional AI development. Instead of "vibe coding" where an AI writes unmanageable spaghetti code in a single prompt, WLP introduces **The Loop Engineer** architecture.

By integrating the rigorous architectural planning of [OpenSpec](https://github.com/Fission-AI/OpenSpec) with the blazing-fast parallel execution of [CCPM](https://github.com/automazeio/ccpm), WLP forces your AI to act as a **Product Manager, Architect, and a team of Parallel Developers** all working in absolute harmony through Git Worktrees.

---

## ✨ Core Philosophy & V3 Features

WLP V3 introduces four enterprise-grade capabilities inspired by the world's most advanced Agent OS frameworks:

1. **🎭 Party Mode (Simulated Council):** WLP does not blindly agree with your feature requests. In the Propose phase, it simulates a rigorous debate between a Product Manager (focusing on UX), a Security Expert (focusing on edge cases), and a Tech Lead (focusing on performance). Your requirements must survive this council before any spec is written.
2. **⚖️ Adaptive Depth & Anti-Conflict:** Not all features require massive architectural documents. WLP adapts: trivial bug fixes get a fast-track task, while enterprise features generate a rigid `design.md`. Crucially, its **Anti-Conflict Logic** analyzes file overlap and explicitly disables parallel execution if two tasks touch the same file.
3. **🧠 Continuous Learning (Learned Memory):** Agents shouldn't make the same mistake twice. WLP features a global `learned.md` ledger. Subagents read this before coding, and append new lessons learned after successfully fixing bugs.
4. **🔗 Brownfield Converge:** Need to jump in and code manually? Go ahead. WLP provides a `converge` command that scans your actual codebase, reconciles it against the AI's Epic tracker, and automatically closes completed tasks or generates new ones to fill the gaps.

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js** v18+
- **Git** (for Worktree orchestration)
- **GitHub CLI (`gh`)** (for automated PR and Issue synchronization)

### 2. Installation
Install the WLP CLI globally via npm:

\`\`\`bash
npm install -g @workaholoop/cli
\`\`\`

### 3. Initialize your workspace
Navigate to your project directory and initialize the Loop Engineer harness:

\`\`\`bash
cd my-project
wlp init --harness all
\`\`\`

*Note: This command scaffolds the required `wlp/` directory structure and installs Slash Commands for popular AI coding extensions (e.g., Claude Code, Google Antigravity, OpenCode).*

---

## 🔄 The 4-Step Auto-Loop

WLP enforces a strict, four-phase lifecycle. You can trigger these via Slash Commands in your AI IDE, or simply by stating your intent in natural language.

### Step 1: Brainstorming & Requirements (`/wlp:propose`)
Initiates the **Party Mode**. The agent acts as a strict council, asking hard questions about edge cases, scopes, and vulnerabilities. 
- **Output:** A bulletproof proposal saved to `wlp/proposals/<name>.md`.

### Step 2: Architecture & Splitting (`/wlp:spec`)
The Architect takes over. It reads the proposal and writes a technical constitution (`design.md`). Then, it breaks the work into an Epic and orthogonal tasks (`001.md`, `002.md`).
- **Output:** `wlp/epics/<name>/design.md`, `epic.md`, and task files.

### Step 3: Parallel Execution (`/wlp:execute`)
Runs the feature end-to-end autonomously:
1. **Sync:** Pushes Epic/Tasks to GitHub Issues.
2. **Worktree:** Checks out an isolated Git worktree (`../.wlp-worktrees/`) so your main branch stays perfectly clean.
3. **Parallel Subagents:** Launches background agents to execute orthogonal tasks simultaneously.
4. **Memory Logging:** Subagents append their learned lessons to `wlp/memory/learned.md`.
5. **Close:** Merges the worktree and opens a GitHub Pull Request.

### Step 4: State Reconciliation (`/wlp:converge`)
Re-assesses the actual codebase against the Epic. If you manually fixed something outside the AI loop, it marks the task as `[x]`. If code is missing, it spawns new tasks to fill the gaps.

---

## 🗂️ Workspace Architecture

When you run `wlp init`, the following structure is injected into your repository. These artifacts serve as the "Source of Truth" for your autonomous agents.

\`\`\`text
.
├── wlp/
│   ├── proposals/       # Vetted requirements (Output of /wlp:propose)
│   ├── prds/            # Legacy PRD storage
│   ├── epics/           # Technical designs, epic trackers, and granular tasks
│   ├── memory/          # Continuous learning ledger (learned.md)
│   ├── archived/        # Completed and merged epics
│   └── skills/          # Agent behavior prompts and intent routers
│       ├── core/        # Core WLP loop logic
│       └── worktree/    # Git worktree orchestration rules
├── .claude/             # Generated slash commands for Claude
├── .agents/             # Generated proxy skills for Google Antigravity
└── .opencode/           # Generated slash commands for OpenCode
\`\`\`

---

## 🧠 Advanced: Learned Memory

WLP implements a lightweight but highly effective **Continuous Learning** cycle inspired by the *Extreme Code Correction (ECC)* framework. 

Every time a parallel Subagent executes a task in `/wlp:execute`, it is injected with the context of `wlp/memory/learned.md`. This file acts as the project's institutional memory. If a subagent spends 10 minutes resolving a tricky Webpack build error, its final step is to append the exact solution to `learned.md`. Future agents assigned to new tasks will read this file and avoid the pitfall entirely.

---

## 🛡️ Advanced: Anti-Conflict Spec

A major danger of parallel AI execution is race conditions—two agents attempting to modify `src/cli.ts` simultaneously, resulting in Git merge conflicts.

WLP solves this in the `/wlp:spec` phase. The Architect agent statically analyzes the proposed tasks. If Task A (Routing) and Task B (Auth) both require modifying `app.tsx`, the Architect explicitly enforces:
\`\`\`yaml
# wlp/epics/auth-feature/002.md
depends_on: ["001.md"]
parallel: false
\`\`\`
Only strictly orthogonal tasks (e.g., updating a Database schema and writing CSS) are permitted to run with `parallel: true`.

---

## 🤝 Contributing

We welcome contributions! Spec-Driven Development is an evolving paradigm, and we are constantly looking to improve our prompts, adapters, and CLI tooling.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

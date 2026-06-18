export const skillMd = `---
name: wlp
description: Spec-Driven State Machine workflow for disciplined agent development
version: 1.0.0
---

# WORKAHOLOOP (WLP) — Core Skill

## When to Activate
Activate this skill when the user expresses intent to:
- Start a new feature, fix, or change
- Define requirements or specifications
- Plan technical implementation  
- Track progress across tasks
- Verify code quality
- Manage project status

## Intent Routing

| User Intent | Command | Reference |
|---|---|---|
| "build/add/create/implement..." | /wlp:propose | → references/propose.md |
| "spec/requirements/criteria..." | /wlp:spec | → references/spec.md |
| "design/plan/architect..."     | /wlp:plan | → references/plan.md |
| "code/execute/implement..."    | /wlp:execute | → references/execute.md |
| "test/verify/check..."         | /wlp:verify | → references/verify.md |
| "done/close/merge/archive..."  | /wlp:close | → references/close.md |
| "auto/chain/end-to-end..."     | /wlp:auto | → references/auto.md |
| "status/standup/progress..."   | Tell user to run \`wlp status\` or \`wlp standup\` in terminal | — |

## Context Loading
Before executing any command, ALWAYS load:
1. \`wlp/constitution.md\` — project rules (ALWAYS)
2. \`wlp/config.json\` — project config (ALWAYS)  
3. \`wlp/changes/active/<current-change>/\` — active change context (if exists)
`;

export const proposeMd = `# Proposal Creation (/wlp:propose)

**Goal:** Define the high-level "Why" and "What" of a change.

## Instructions
1. Create a directory for this change: \`wlp/changes/active/<slug>/\`. The slug should be a short, kebab-case identifier (e.g., \`add-dark-mode\`).
2. Inside that directory, create \`proposal.md\`.
3. The proposal MUST include YAML frontmatter matching \`references/conventions.md\`.
4. The proposal MUST contain:
   - **Problem Statement:** What are we trying to solve?
   - **Scope:** What is included and what is excluded?
   - **Success Criteria:** How do we know it works?

## Output
\`wlp/changes/active/<slug>/proposal.md\`
`;

export const specMd = `# Spec Creation (/wlp:spec)

**Goal:** Translate the proposal into detailed technical requirements and acceptance criteria.

## 🚨 RESEARCH-FIRST INSTINCT
You MUST read existing, relevant code in the workspace BEFORE writing the spec. You cannot write a spec in a vacuum. Understand the current architecture, data models, and related components first.

## Instructions
1. Read the \`proposal.md\` for the active change.
2. Create a \`specs/\` directory inside the active change folder.
3. Write \`specs/main.md\` (or split into multiple files if complex).
4. The spec MUST contain:
   - **Acceptance Criteria:** A bulleted list of verifiable behaviors.
   - **Edge Cases:** What could go wrong and how to handle it.
   - **Data Shapes:** Interfaces, schemas, or models (if applicable).
5. Update \`proposal.md\` frontmatter to \`status: specced\`.
`;

export const planMd = `# Implementation Plan Creation (/wlp:plan)

**Goal:** Architect the solution and break it down into executable tasks.

## Instructions
1. Read the \`specs/\` for the active change.
2. Create \`design.md\` in the active change folder. It MUST contain:
   - **Architecture:** High-level approach.
   - **File Changes:** Which existing files will be modified, and which new files will be created.
   - **Dependencies:** Any new npm packages or external APIs needed.
3. Create \`tasks.md\` in the active change folder. It MUST include YAML frontmatter tracking the number of tasks.
4. The \`tasks.md\` MUST be a markdown checklist (\`- [ ]\`) broken down into logical phases.
5. Update \`proposal.md\` and \`tasks.md\` frontmatter to \`status: planned\`.
`;

export const executeMd = `# Execution (/wlp:execute)

**Goal:** Write the code to fulfill the plan.

## Instructions
1. Read \`tasks.md\` to find the next pending task.
2. DO NOT implement everything at once. Focus on one task or phase at a time.
3. Write the necessary code.
4. Check off the task in \`tasks.md\` (\`- [x]\`) and update the \`completed\` counter in the frontmatter.
5. Update \`tasks.md\` frontmatter to \`status: active\`.
6. Repeat until all tasks are complete.
`;

export const verifyMd = `# Verification (/wlp:verify)

**Goal:** Ensure the code meets quality standards and specs before closing.

## Instructions
1. Read the \`verify\` commands from \`wlp/config.json\` (e.g., lint, test, typecheck).
2. Execute these commands in the terminal.
3. If ANY command fails:
   - Read the error.
   - Fix the code.
   - Run the command again.
4. If ALL commands pass, update \`tasks.md\` frontmatter to \`status: verified\`.
5. You CANNOT proceed to close until status is verified.
`;

export const closeMd = `# Close Change (/wlp:close)

**Goal:** Finalize the change, clean up the workspace, and integrate.

## Instructions
1. Ensure the change has \`status: verified\`. If not, refuse to close and tell the user to run \`/wlp:verify\`.
2. Generate a Semantic Commit message based on the work done (e.g., \`feat: add dark mode\`).
3. Commit the changes. (If using branches, squash merge).
4. Run \`wlp sync\` to sync the final state to GitHub Issues (if configured).
5. Move the entire \`wlp/changes/active/<slug>\` folder to \`wlp/changes/archive/YYYY-MM-DD-<slug>\`.
`;

export const conventionsMd = `# WLP Conventions

## Frontmatter Schemas

### proposal.md
\`\`\`yaml
---
slug: string
status: proposed | specced | planned | active | verified | closed
created: YYYY-MM-DD
author: string
github_issue: number | null
priority: low | medium | high | critical
tags: string[]
---
\`\`\`

### tasks.md
\`\`\`yaml
---
slug: string
status: planned | active | verified | closed
total_tasks: number
completed: number
---
\`\`\`

## Strict Workflow Rules
- Code MUST NOT be written until \`tasks.md\` exists.
- A change MUST NOT be closed until verification commands pass.
- Changes in \`archive/\` are read-only and serve as project history.
`;

export const autoMd = `# Auto-Pilot (/wlp:auto)

**Goal:** Run the full WLP lifecycle sequentially without human intervention.

## Instructions
1. Execute the entire WLP State Machine sequentially for the user's request.
2. Flow: Propose -> Spec -> Plan -> Execute -> Verify -> Close.
3. You MUST complete one phase, update the status frontmatter, and immediately proceed to the next phase.
4. Do NOT stop for human review unless you encounter a critical failure you cannot self-heal.
`;

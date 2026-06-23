export const topLevelSkillMd = `---
name: wlp
description: The Loop Engineer - Intent Routing and Automated Workflow (Propose -> Spec -> Execute)
version: 3.0.0
---

# WORKAHOLOOP (WLP) — The Loop Engineer

## Intent Routing

| User Intent | Phase | Reference |
|---|---|---|
| "I want to build...", "Let's brainstorm...", "Propose a feature" | **Propose** | → references/propose.md |
| "Write PRD", "Break down tasks", "Generate spec" | **Spec** | → references/spec.md |
| "Start coding", "Do it", "Execute", "Run the loop" | **Execute** | → references/execute.md |
| "Verify the codebase", "Run tests", "Validate changes", "Check for bugs" | **Verify** | → references/verify.md |
| "Auto-pilot", "Chain commands", "Run end-to-end", "Do all steps autonomously" | **Auto** | → references/auto.md |
| "Sync codebase", "I manually edited code", "Check what is missing" | **Converge** | → references/converge.md |

## Context Loading
Always load:
1. \`wlp/constitution.md\`
2. \`wlp/config.json\`
3. \`wlp/memory/learned.md\` (IMPORTANT: This contains past lessons to avoid repeating mistakes)
4. \`wlp/epics/<current-epic>/design.md\` (if executing)
`;

export const proposeMd = `# Propose (/wlp:propose)

**Goal:** Rigorous brainstorming and validation using SIMULATED COUNCIL, resulting in a Proposal and a validated PRD.

## 🚨 BEHAVIOR: THE SIMULATED COUNCIL (PARTY MODE)
Before producing any artifact, you must simulate a debate between 3 personas:
1. **The Product Manager:** Focuses on user value, scope, and "why".
2. **The Security/Ops Expert:** Focuses on vulnerabilities, edge cases, rate limits, and abuse.
3. **The Tech Lead:** Focuses on performance, feasibility, and pushes back against feature creep.

You MUST display this debate to the user. Ask probing questions based on this debate.
Do NOT blindly agree with the user. If the user asks for something illogical or overly complex, push back!

## Instructions
1. **Simulate Council:** Display the 3-persona Simulated Council debate to the user.
2. **Draft PRD:** Write a draft PRD containing the initial requirements to \`wlp/prds/<name>.md\` (set \`status: drafted\`).
3. **Validate & Clarify:** Ask clarification questions to the user based on the debate and the draft PRD.
4. **Final Approval:** Present the finalized PRD to the user for final validation and approval. Once approved, update the status to \`approved\`.
`;

export const specMd = `# Spec (/wlp:spec)

**Goal:** Translate the PRD into a Technical Design and Epic with Adaptive Depth and Anti-Conflict Task splitting.

## 🚨 BEHAVIOR: ADAPTIVE DEPTH & ANTI-CONFLICT LOGIC
1. **Adaptive Depth Analysis:** Assess the complexity of the feature.
   - **Trivial** (e.g., typos, CSS tweaks, simple UI copy): Skip \`design.md\`. Generate a single task \`001.md\` with \`parallel: false\`.
   - **Moderate/Enterprise**: MUST generate \`design.md\` (Architecture, Schema, API contracts) first.
2. **Anti-Conflict Splitting:** When creating multiple tasks (\`001.md\`, \`002.md\`), analyze file overlap.
   - If Task A and Task B touch the same file or share logic, set \`parallel: false\` and use \`depends_on\`.
   - Only set \`parallel: true\` for strictly orthogonal tasks.

## Instructions
1. Read the PRD (\`wlp/prds/<name>.md\`).
2. Generate \`design.md\` (if Moderate/Enterprise).
3. Create \`wlp/epics/<name>/epic.md\` (Epic tracking file).
4. Create Task files (\`wlp/epics/<name>/001.md\`, etc.) with strict anti-conflict metadata. **CRITICAL:** For each task, you MUST define clear **Test Plan / Verification Criteria** (e.g., which tests to run, what test file to create or update, what cases to cover).
`;

export const executeMd = `# Execute (/wlp:execute)

**Goal:** The Ultimate Auto-Loop (Sync -> Worktree -> Subagents -> Track -> Close)

## 🚨 THE AUTOMATED LOOP
Drive the execution without interrupting the user.

## Instructions
1. **Sync:** Run \`npx wlp sync\` to push the Epic and Tasks to GitHub Issues.
2. **Worktree:** 
   - **Check commits:** Ensure the repository has at least one commit (run \`git log -1\` or check \`git rev-parse --verify HEAD\`). If it has no commits (empty repo), create an initial empty commit first: \`git commit --allow-empty -m "Initial commit"\`.
   - Create worktree: \`git worktree add ../.wlp-worktrees/<name> -b epic/<name>\`
3. **Subagents:**
   - Launch parallel subagents using \`invoke_subagent\` for tasks with \`status: open\` and no unmet dependencies.
   - **CRITICAL SUBAGENT PROMPT:** 
     "You are assigned Task #<N>. 
     1. Read \`wlp/memory/learned.md\` to avoid past mistakes.
     2. Read \`../.wlp-worktrees/<name>/wlp/epics/<name>/design.md\` (if it exists).
     3. Read your task at \`wlp/epics/<name>/<N>.md\`.
     4. Modify code using relative path \`../.wlp-worktrees/<name>/...\`.
     5. Run \`npx wlp verify\` inside your worktree (if you are running in a worktree) or in current directory to ensure all tests, types, and lints pass.
     6. BEFORE FINISHING: Identify one lesson learned or pitfall avoided, and append it to \`wlp/memory/learned.md\`."
4. **Track:** Wait for all subagents to finish. Mark their tasks as \`status: closed\`.
5. **Verify:** Run \`npx wlp verify <name>\` to verify the combined changes in the epic worktree (or just \`npx wlp verify\` if not using worktrees). If verification fails, troubleshoot and fix the issues.
6. **Close:** Run \`npx wlp close <name>\`.
`;

export const convergeMd = `# Converge (/wlp:converge)

**Goal:** Re-assess the codebase against the active Spec/Epic and append or close tasks (Brownfield sync).

## 🚨 BEHAVIOR: STATE RECONCILIATION
Users often write code manually outside the agent loop. This command prevents the Codebase and the Epic from diverging.

## Instructions
1. Read the active \`wlp/epics/<name>/epic.md\`, \`design.md\`, and all Tasks.
2. Analyze the actual source code to see what has been implemented.
3. If a task was manually implemented by the user, update the task markdown file to \`status: closed\` and check the box in \`epic.md\`.
4. If the codebase is missing something that the design requires but there is no task for it, CREATE a new task (e.g., \`005.md\`) and append it to the \`epic.md\`.
5. Report the reconciliation summary to the user.
`;

export const conventionsMd = `# Conventions

## PRD (\`wlp/prds/<name>.md\`)
\`\`\`yaml
---
name: <feature>
status: drafted | approved
created: <datetime>
---
\`\`\`

## Epic (\`wlp/epics/<name>/epic.md\`)
\`\`\`yaml
---
name: <feature>
status: backlog | in-progress | completed
github: url
---
\`\`\`

## Task (\`wlp/epics/<name>/<N>.md\`)
\`\`\`yaml
---
name: <task>
status: open | in-progress | closed
depends_on: []
parallel: true | false
---
\`\`\`
`;

export const verifyMd = `# Verify (/wlp:verify)

**Goal:** Run the full validation suite (lint, typecheck, test, build) to verify correctness and prevent errors.

## Instructions
1. Run \`npx wlp verify\` in the current directory, or \`npx wlp verify <epic-slug>\` to run checks on a specific epic worktree.
2. Observe output. If any step (lint, typecheck, test, build) fails:
   - Identify the cause of the failure from the log.
   - Fix the code or configuration.
   - Re-run \`npx wlp verify\` until everything passes cleanly.
`;

export const autoMd = `# Auto-Pilot (/wlp:auto)

**Goal:** Run the full WLP lifecycle sequentially from Propose to Close, maintaining human validation checkpoints for specifications.

## 🚨 THE AUTOPILOT LIFECYCLE
You are driving the entire lifecycle. You must navigate from Propose -> Spec -> Execute -> Verify -> Close automatically, but you MUST respect the critical validation checkpoints with the user.

## Instructions

### Phase 1: Propose (Brainstorm & PRD)
1. **Simulate Council:** You MUST run and display the 3-persona Simulated Council debate (PM, Security, Tech Lead) in the chat to brainstorm requirements.
2. **Draft PRD:** Write a draft PRD containing the initial requirements to \`wlp/prds/<name>.md\` (set \`status: drafted\`).
3. **USER CHECKPOINT (Validation):** Present the draft PRD to the user and ask: *"Please review this PRD. Type 'approve' to start technical design and execution, or provide feedback."*
4. **WAIT** for the user's validation/approval. Once approved, update status to \`approved\` and proceed to Phase 2 (Spec).

### Phase 2: Spec (Design & Tasks)
1. **Design:** Generate \`wlp/epics/<name>/design.md\` based on the approved PRD (for Moderate/Enterprise changes).
2. **Tasks:** Create \`wlp/epics/<name>/epic.md\` and tasks (\`001.md\`, etc.) with clear test plans.
3. **USER CHECKPOINT (Optional):** Inform the user of the task breakdown and design. Proceed to Phase 3.

### Phase 3: Execute (Coding & Verification)
1. **Sync:** Run \`npx wlp sync\` to push the epic/tasks to GitHub.
2. **Worktree:** Create the execution environment: \`git worktree add ../.wlp-worktrees/<name> -b epic/<name>\`
3. **Subagents:** Launch parallel subagents using \`invoke_subagent\` for open tasks. Each subagent must run \`npx wlp verify\` in their worktree before completing.
4. **Track:** Wait for all subagents to finish and mark tasks as closed.

### Phase 4: Verify (Integration Testing)
1. **Verify:** Run \`npx wlp verify <name>\` inside the epic worktree to ensure lint, typecheck, test, and build all pass.
2. **Troubleshoot:** If verification fails, self-heal by fixing the bugs in the worktree and re-running verify.

### Phase 5: Close (PR & Archive)
1. **Close:** Run \`npx wlp close <name>\` to push the branch, create the GitHub PR, and archive the epic.
2. **Report:** Report the completion summary to the user with the PR link.
`;

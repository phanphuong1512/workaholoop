export const skillMd = `---
name: wlp
description: CCPM-style spec-driven workflow: PRD -> Epic -> GitHub Issues -> Parallel Agents
version: 2.0.0
---

# WORKAHOLOOP (WLP) — CCPM Architecture

## Intent Routing

| User Intent | Command | Reference |
|---|---|---|
| "write a PRD", "plan feature X" | /wlp:plan | → references/plan.md |
| "turn PRD into epic", "break down epic" | /wlp:structure | → references/structure.md |
| "push to github", "sync epic" | /wlp:sync | → references/sync.md |
| "start working on issue", "execute" | /wlp:execute | → references/execute.md |
| "status", "standup" | /wlp:track | → references/track.md |

## Context Loading
Always load:
1. \`wlp/constitution.md\`
2. \`wlp/config.json\`
3. \`wlp/epics/<current-epic>/\` (if working on an epic)
`;

export const planMd = `# Plan (/wlp:plan)

**Goal:** Capture requirements into a PRD.

## Instructions
1. Create a PRD file: \`wlp/prds/<name>.md\`.
2. Include problem statement, target audience, scope, and non-goals.
3. Keep it strictly focused on product requirements, not technical architecture.
`;

export const structureMd = `# Structure (/wlp:structure)

**Goal:** Translate PRD into a Technical Epic and decompose into tasks.

## Instructions
1. Create \`wlp/epics/<name>/epic.md\` referencing the PRD.
2. Decompose the work into independent tasks: \`wlp/epics/<name>/001.md\`, \`002.md\`, etc.
3. Task files must contain \`depends_on\` and \`parallel\` frontmatter to allow parallel execution.
`;

export const executeMd = `# Execute (/wlp:execute)

**Goal:** Start building using parallel agents and git worktrees.

## 🚨 WORKTREE COORDINATION RULES
- **DO NOT create symlinks for state.**
- You must operate from the main repository root where \`wlp/\` exists.
- Create the git worktree: \`git worktree add ../.wlp-worktrees/<name> -b epic/<name>\`
- When modifying code, use the relative path to the worktree: \`../.wlp-worktrees/<name>/path/to/code\`
- This ensures you can read \`wlp/epics/\` locally while writing code into the isolated worktree.

## Instructions
1. Read the task file: \`wlp/epics/<epic>/<N>.md\`.
2. Implement the changes in \`../.wlp-worktrees/<epic>/\`.
3. Commit frequently inside the worktree: \`cd ../.wlp-worktrees/<epic> && git commit -m "Issue #<N>: ..."\`
4. Update the task frontmatter to \`status: closed\` when done.
`;

export const syncMd = `# Sync (/wlp:sync)

**Goal:** Push tasks to GitHub Issues and Epics.

## Instructions
1. Tell the user to run \`npx wlp sync\` in their terminal.
2. The CLI will handle creating issues, attaching labels, and renaming \`001.md\` to \`<IssueNumber>.md\`.
`;

export const verifyMd = `# Verify (/wlp:verify)

**Goal:** Run tests inside the worktree.

## Instructions
1. \`cd ../.wlp-worktrees/<epic>\`
2. Run \`npm run test\`, \`npm run lint\`.
`;

export const trackMd = `# Track (/wlp:track)

**Goal:** Check status.

## Instructions
1. Run \`npx wlp status\` or \`npx wlp standup\`.
2. Parse the output for the user.
`;

export const closeMd = `# Close (/wlp:close)

**Goal:** Archive the epic and prepare for PR.

## Instructions
1. Ensure all tasks in \`wlp/epics/<name>/\` are \`status: closed\`.
2. Run \`npx wlp close <name>\`.
3. Remind the user to open a Pull Request on GitHub for branch \`epic/<name>\`.
`;

export const conventionsMd = `# Conventions

## PRD (\`wlp/prds/<name>.md\`)
\`\`\`yaml
---
name: <feature>
status: backlog | active | completed
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
parallel: true
---
\`\`\`
`;

export const autoMd = `# Auto-Pilot (/wlp:auto)
Run Plan -> Structure -> Execute -> Close sequentially.
`;

export const worktreeSkillMd = `---
name: wlp-worktree
description: Parallel execution skill using git worktree
version: 1.0.0
---

# WORKAHOLOOP (WLP) — Worktree Skill

## When to Activate
Activate this skill when the user wants to execute a change in an isolated environment, run multiple changes in parallel, or specifically mentions "worktree".

## Instructions
1. When starting execution (\`/wlp:execute\`), create a git worktree instead of a regular branch.
   \`git worktree add ../.wlp-worktrees/<slug> -b wlp/<slug>\`
2. Change your working directory to the new worktree.
3. If running a dev server, assign a unique port from the range defined in \`wlp/config.json\`.
4. When closing the change (\`/wlp:close\`), you MUST run the teardown process:
   - Commit changes.
   - Run \`git worktree remove ../.wlp-worktrees/<slug>\`.
   - Run \`git branch -d wlp/<slug>\` (after merge).
`;

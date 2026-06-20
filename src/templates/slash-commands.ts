export const slashCommands: Record<string, string> = {
  'wlp/propose.md': `---
name: WLP: Propose
description: Brainstorm and capture rigorous requirements (Phase 1)
---
# /wlp:propose
Use this command to rigorous brainstorm and write a PRD to \`wlp/proposals/\`.`,

  'wlp/spec.md': `---
name: WLP: Spec
description: Generate technical design and split anti-conflict tasks (Phase 2)
---
# /wlp:spec
Use this command to generate \`design.md\`, \`epic.md\` and anti-conflict tasks.`,

  'wlp/execute.md': `---
name: WLP: Execute
description: Run the ultimate auto-loop: sync, worktree, subagents, close (Phase 3)
---
# /wlp:execute
Run the fully automated loop.`,

  'wlp/converge.md': `---
name: WLP: Converge
description: Re-assess codebase against Epic and sync tasks
---
# /wlp:converge
Run this to sync manual code changes with the Epic.`
};

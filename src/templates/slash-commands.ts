export const slashCommands: Record<string, string> = {
  'wlp/plan.md': `---
name: WLP: Plan
description: Write a PRD
---
# /wlp:plan
Use this command to define requirements in \`wlp/prds/\`.`,

  'wlp/structure.md': `---
name: WLP: Structure
description: Break PRD into an Epic and Tasks
---
# /wlp:structure
Use this command to create \`wlp/epics/<name>/epic.md\` and task files (\`001.md\`).`,

  'wlp/sync.md': `---
name: WLP: Sync
description: Push epic and tasks to GitHub
---
# /wlp:sync
Tell the user to run \`npx wlp sync\`.`,

  'wlp/execute.md': `---
name: WLP: Execute
description: Build the feature in a worktree
---
# /wlp:execute
1. Stay in root directory.
2. Read tasks from \`wlp/epics/\`.
3. Create/edit code in \`../.wlp-worktrees/<name>/\`.`,

  'wlp/track.md': `---
name: WLP: Track
description: Check project status
---
# /wlp:track
Run \`npx wlp status\`.`,

  'wlp/close.md': `---
name: WLP: Close
description: Archive epic locally
---
# /wlp:close
Run \`npx wlp close <name>\` to archive locally, then open a GitHub PR.`
};

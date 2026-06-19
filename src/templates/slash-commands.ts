export const slashCommands: Record<string, string> = {
  'wlp/propose.md': `---
name: WLP: Propose
description: Propose a new feature or change
---
# /wlp:propose

Use this command when the user expresses intent to: build, add, create, or implement a new feature.

## INSTRUCTIONS
1. Create a new directory in \`wlp/changes/active/<slug>/\`.
2. Generate a \`proposal.md\` file describing the problem, scope, and success criteria.
3. Keep it high-level. Do NOT write technical specs yet.`,

  'wlp/spec.md': `---
name: WLP: Spec
description: Write technical specifications and acceptance criteria
---
# /wlp:spec

Use this command when the user expresses intent to: write specs, define requirements, or outline criteria.

## INSTRUCTIONS
1. MUST READ existing relevant code first.
2. Inside the current active change directory (\`wlp/changes/active/<slug>/\`), create a \`specs/\` directory.
3. Write acceptance criteria, edge cases, and data shapes in \`specs/main.md\`.`,

  'wlp/plan.md': `---
name: WLP: Plan
description: Design architecture and write implementation plan
---
# /wlp:plan

Use this command when the user expresses intent to: design, architect, or write the implementation plan.

## INSTRUCTIONS
1. Read the specs in \`wlp/changes/active/<slug>/specs/\`.
2. Create \`design.md\` with the technical approach and file changes.
3. Create \`tasks.md\` with a detailed checklist of implementation steps.`,

  'wlp/execute.md': `---
name: WLP: Execute
description: Execute tasks and write code
---
# /wlp:execute

Use this command when the user expresses intent to: start coding, execute the plan, or implement tasks.

## INSTRUCTIONS
1. Create a new git branch (or worktree if enabled).
2. Execute tasks one by one from \`tasks.md\`.
3. Mark tasks as completed in \`tasks.md\` as you go.`,

  'wlp/verify.md': `---
name: WLP: Verify
description: Verify code quality and run tests
---
# /wlp:verify

Use this command when the user expresses intent to: run tests, check quality, or verify the code.

## INSTRUCTIONS
1. Run the verification commands defined in \`wlp/config.json\` (lint, test, typecheck).
2. If any fail, fix the code and run again.
3. If all pass, update \`tasks.md\` to reflect verified status.`,

  'wlp/close.md': `---
name: WLP: Close
description: Close change, merge, and archive
---
# /wlp:close

Use this command when the user expresses intent to: finish, merge, or archive the change.

## INSTRUCTIONS
1. Verify that all tasks are complete and verification has passed.
2. Run the command: \`npx wlp close <slug>\` to squash merge and archive the directory automatically. (Do NOT manually move the directory).
3. Close the associated GitHub issue if syncing is enabled.`,

  'wlp/auto.md': `---
name: WLP: Auto-Pilot
description: Run the full WLP lifecycle sequentially without human intervention
---
# /wlp:auto

Use this command when the user wants to chain commands or run a feature end-to-end autonomously (like ECC).

## INSTRUCTIONS
1. Execute the entire WLP State Machine sequentially for the user's request.
2. Flow: Propose -> Spec -> Plan -> Execute -> Verify -> Close.
3. You MUST complete one phase, update the status frontmatter, and immediately proceed to the next phase.
4. Do NOT stop for human review unless you encounter a critical failure you cannot self-heal.`
};

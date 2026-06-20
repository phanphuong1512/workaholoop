---
name: "wlp:close"
description: "Close change, merge, and archive"
---

---
name: WLP: Close
description: Close change, merge, and archive
---
# /wlp:close

Use this command when the user expresses intent to: finish, merge, or archive the change.

## INSTRUCTIONS
1. Verify that all tasks are complete and verification has passed.
2. Run the command: `npx wlp close <slug>` to squash merge and archive the directory automatically. (Do NOT manually move the directory).
3. Close the associated GitHub issue if syncing is enabled.

***
**WLP CORE REQUIREMENT:** 
To properly execute this command, you MUST also read the global rules in `wlp/skills/core/SKILL.md`.

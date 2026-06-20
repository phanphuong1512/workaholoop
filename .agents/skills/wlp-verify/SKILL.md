---
name: "wlp:verify"
description: "Verify code quality and run tests"
---

---
name: WLP: Verify
description: Verify code quality and run tests
---
# /wlp:verify

Use this command when the user expresses intent to: run tests, check quality, or verify the code.

## INSTRUCTIONS
1. Run the verification commands defined in `wlp/config.json` (lint, test, typecheck).
2. If any fail, fix the code and run again.
3. If all pass, update `tasks.md` to reflect verified status.

***
**WLP CORE REQUIREMENT:** 
To properly execute this command, you MUST also read the global rules in `wlp/skills/core/SKILL.md`.

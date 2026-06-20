---
name: "wlp:auto"
description: "Run the full WLP lifecycle sequentially without human intervention"
---

---
name: WLP: Auto-Pilot
description: Run the full WLP lifecycle sequentially without human intervention
---
# /wlp:auto

Use this command when the user wants to chain commands or run a feature end-to-end autonomously (like ECC).

## INSTRUCTIONS
1. Execute the entire WLP State Machine sequentially for the user's request.
2. Flow: Propose -> Spec -> Plan -> Execute -> Verify -> Close.
3. You MUST complete one phase, update the status frontmatter, and immediately proceed to the next phase.
4. Do NOT stop for human review unless you encounter a critical failure you cannot self-heal.

***
**WLP CORE REQUIREMENT:** 
To properly execute this command, you MUST also read the global rules in `wlp/skills/core/SKILL.md`.

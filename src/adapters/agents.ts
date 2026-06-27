import fs from 'fs';
import path from 'path';
import pc from 'picocolors';
import { HarnessAdapter } from './types.js';

export const agentsAdapter: HarnessAdapter = {
  id: 'agents',
  name: 'Open Standard',
  generateCommands(cwd: string, commands: Record<string, string>): void {
    let count = 0;

    // 1. Create the master WLP skill
    const globalSkillPath = path.join(cwd, '.agents/skills/wlp/SKILL.md');
    fs.mkdirSync(path.dirname(globalSkillPath), { recursive: true });
    
    const masterSkillContent = `---
name: wlp
description: "Workaholoop (WLP) Spec-Driven State Machine. ACTIVATE this skill when the user wants to propose, spec, plan, execute, verify, or close a feature using the WLP workflow."
---

# Workaholoop (WLP)

To execute WLP workflows, you MUST read and strictly follow the state machine defined in \`wlp/skills/core/SKILL.md\` and its references.
`;

    if (!fs.existsSync(globalSkillPath)) {
      fs.writeFileSync(globalSkillPath, masterSkillContent);
      count++;
    }

    // 2. Create specific slash command skills
    for (const [filename, content] of Object.entries(commands)) {
      const baseName = filename.replace('.md', '');
      const folderName = baseName.replace(/\//g, '-');
      const skillName = baseName.replace(/\//g, ':');

      const skillPath = path.join(cwd, '.agents/skills', folderName, 'SKILL.md');
      const dirPath = path.dirname(skillPath);
      
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      if (!fs.existsSync(skillPath)) {
        const descMatch = content.match(/description:\s*(.*)/);
        const desc = descMatch ? descMatch[1] : 'WLP Command';

        const proxyContent = `---
name: "${skillName}"
description: "${desc}"
---

${content}

***
**WLP CORE REQUIREMENT:** 
To properly execute this command, you MUST also read the global rules in \`wlp/skills/core/SKILL.md\`.
`;
        fs.writeFileSync(skillPath, proxyContent);
        count++;
      }
    }

    if (count > 0) {
      console.log(pc.green('✓ Created .agents/skills/ proxy skills for Copilot/Antigravity'));
    } else {
      console.log(pc.gray('- .agents/skills/ proxy skills already exist'));
    }
  }
};

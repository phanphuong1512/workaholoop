import pc from 'picocolors';
import { HarnessAdapter } from './types.js';

export const antigravityAdapter: HarnessAdapter = {
  id: 'antigravity',
  name: 'Google Antigravity',
  generateCommands(cwd: string, commands: Record<string, string>): void {
    console.log(pc.cyan('\nℹ Antigravity Integration Detected'));
    console.log(pc.gray('- Antigravity does not use local .claude/ slash command files.'));
    console.log(pc.gray('- Instead, it natively reads the WLP Skill System in `wlp/skills/core/SKILL.md`.'));
    console.log(pc.gray('- You can type `/wlp:propose` directly in chat and Antigravity will map it using Intent Routing.'));
  }
};

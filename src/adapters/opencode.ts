import fs from 'fs';
import path from 'path';
import pc from 'picocolors';
import { HarnessAdapter } from './types.js';

export const opencodeAdapter: HarnessAdapter = {
  id: 'opencode',
  name: 'OpenCode',
  generateCommands(cwd: string, commands: Record<string, string>): void {
    let count = 0;
    for (const [filename, content] of Object.entries(commands)) {
      const cmdPath = path.join(cwd, '.opencode/commands', filename);
      const dirPath = path.dirname(cmdPath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      if (!fs.existsSync(cmdPath)) {
        fs.writeFileSync(cmdPath, content);
        count++;
      }
    }
    if (count > 0) {
      console.log(pc.green('✓ Created .opencode/commands/wlp/ slash command files'));
    } else {
      console.log(pc.gray('- .opencode/commands/wlp/ slash command files already exist'));
    }
  }
};

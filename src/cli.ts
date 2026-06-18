#!/usr/bin/env node

import { Command } from 'commander';
import pc from 'picocolors';
import { createRequire } from 'module';
import { initCommand } from './commands/init.js';
import { statusCommand } from './commands/status.js';
import { standupCommand } from './commands/standup.js';
import { validateCommand } from './commands/validate.js';
import { searchCommand } from './commands/search.js';
import { closeCommand } from './commands/close.js';
import { syncCommand } from './commands/sync.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const program = new Command();

program
  .name('wlp')
  .description('WLP CLI - Spec-Driven State Machine for Agents')
  .version(pkg.version);

program.addCommand(initCommand);
program.addCommand(statusCommand);
program.addCommand(standupCommand);
program.addCommand(validateCommand);
program.addCommand(searchCommand);
program.addCommand(closeCommand);
program.addCommand(syncCommand);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

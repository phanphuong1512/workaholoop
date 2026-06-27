import { claudeAdapter } from './claude.js';
import { agentsAdapter } from './agents.js';
import { HarnessAdapter } from './types.js';

export const ALL_ADAPTERS: HarnessAdapter[] = [
  claudeAdapter,
  agentsAdapter,
];

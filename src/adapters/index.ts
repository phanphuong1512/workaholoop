import { claudeAdapter } from './claude.js';
import { antigravityAdapter } from './antigravity.js';
import { opencodeAdapter } from './opencode.js';
import { copilotAdapter } from './copilot.js';
import { HarnessAdapter } from './types.js';

export const ALL_ADAPTERS: HarnessAdapter[] = [
  claudeAdapter,
  antigravityAdapter,
  opencodeAdapter,
  copilotAdapter,
];

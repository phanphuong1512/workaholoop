import { claudeAdapter } from './claude.js';
import { antigravityAdapter } from './antigravity.js';
import { opencodeAdapter } from './opencode.js';
import { HarnessAdapter } from './types.js';

export const ALL_ADAPTERS: HarnessAdapter[] = [
  claudeAdapter,
  antigravityAdapter,
  opencodeAdapter,
  // Add cursorAdapter, windsurfAdapter, copilotAdapter here in the future
];

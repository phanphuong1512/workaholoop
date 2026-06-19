import { claudeAdapter } from './claude.js';
import { antigravityAdapter } from './antigravity.js';
import { HarnessAdapter } from './types.js';

export const ALL_ADAPTERS: HarnessAdapter[] = [
  claudeAdapter,
  antigravityAdapter,
  // Add cursorAdapter, windsurfAdapter, copilotAdapter here in the future
];

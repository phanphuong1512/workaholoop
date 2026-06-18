import { claudeAdapter } from './claude.js';
import { HarnessAdapter } from './types.js';

export const ALL_ADAPTERS: HarnessAdapter[] = [
  claudeAdapter,
  // Add cursorAdapter, windsurfAdapter, copilotAdapter here in the future
];

#!/usr/bin/env node

/**
 * WLP - Static Executable Wrapper
 * This file is committed to Git with chmod +x permissions.
 * It serves as the stable entry point for NPM, ensuring cross-platform 
 * executable rights without relying on the auto-generated dist/ folder.
 */

const MIN_NODE_VERSION = 18;

const currentNodeVersion = process.versions.node;
const majorVersion = parseInt(currentNodeVersion.split('.')[0], 10);

if (majorVersion < MIN_NODE_VERSION) {
  console.error(
    `\\x1b[31mError: You are running Node.js v${currentNodeVersion}.\\x1b[0m`
  );
  console.error(
    `\\x1b[33mWLP requires Node.js v${MIN_NODE_VERSION} or higher. Please upgrade your Node version.\\x1b[0m`
  );
  process.exit(1);
}

try {
  // Dynamically import the compiled CLI bundle
  await import('../dist/cli.js');
} catch (error) {
  if (error.code === 'ERR_MODULE_NOT_FOUND' || error.code === 'MODULE_NOT_FOUND') {
    console.error('\\x1b[31mError: Compiled CLI not found in dist/\\x1b[0m');
    console.error('\\x1b[33mDid you forget to run \\`npm run build\\`?\\x1b[0m');
    process.exit(1);
  } else {
    throw error;
  }
}

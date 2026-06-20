import { Command } from 'commander';
import pc from 'picocolors';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface VerifyConfig {
  lint?: string;
  test?: string;
  typecheck?: string;
  build?: string;
}

export const verifyCommand = new Command('verify')
  .description('Run validation checks (lint, typecheck, test, build) on CWD or a worktree')
  .argument('[slug]', 'The epic slug to verify (runs in its worktree if present)')
  .option('-l, --lint', 'Run linting only')
  .option('-t, --test', 'Run tests only')
  .option('-c, --typecheck', 'Run typechecking only')
  .option('-b, --build', 'Run build only')
  .action((slug, options) => {
    const cwd = process.cwd();
    let targetDir = cwd;

    console.log(pc.blue(pc.bold('\n[WLP Verify Phase]\n')));

    // 1. Resolve Target Directory
    if (slug) {
      const worktreePath = path.join(cwd, '..', '.wlp-worktrees', slug);
      if (fs.existsSync(worktreePath)) {
        targetDir = worktreePath;
        console.log(pc.gray(`Targeting worktree: ${targetDir}`));
        
        // 2. Auto-Symlink node_modules
        const mainNodeModules = path.join(cwd, 'node_modules');
        const worktreeNodeModules = path.join(targetDir, 'node_modules');
        
        if (fs.existsSync(mainNodeModules) && !fs.existsSync(worktreeNodeModules)) {
          try {
            console.log(pc.gray(`Creating node_modules symlink in worktree...`));
            fs.symlinkSync(mainNodeModules, worktreeNodeModules, 'dir');
            console.log(pc.green(`+ Symlinked node_modules successfully.`));
          } catch (e: any) {
            console.log(pc.yellow(`! Warning: Failed to symlink node_modules: ${e.message}`));
          }
        }
      } else {
        console.log(pc.yellow(`! Worktree not found for '${slug}' at ${worktreePath}.`));
        console.log(pc.gray(`Falling back to current directory: ${cwd}`));
      }
    } else {
      console.log(pc.gray(`Targeting current directory: ${cwd}`));
    }

    // 3. Read config.json
    const configPath = path.join(cwd, 'wlp/config.json');
    let verifyConfig: VerifyConfig = {};

    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        if (config.verify) {
          verifyConfig = config.verify;
        }
      } catch (e: any) {
        console.log(pc.red(`! Error reading wlp/config.json: ${e.message}`));
        process.exit(1);
      }
    }

    // Define steps to run
    const steps: { name: string; key: keyof VerifyConfig; defaultCmd: string }[] = [
      { name: 'Linting', key: 'lint', defaultCmd: 'npm run lint' },
      { name: 'Typechecking', key: 'typecheck', defaultCmd: 'tsc --noEmit' },
      { name: 'Testing', key: 'test', defaultCmd: 'npm run test' },
      { name: 'Building', key: 'build', defaultCmd: 'npm run build' },
    ];

    // Filter steps based on options (if any are specified)
    const hasAnyOption = options.lint || options.test || options.typecheck || options.build;
    const stepsToRun = steps.filter(step => {
      if (hasAnyOption) {
        return (
          (step.key === 'lint' && options.lint) ||
          (step.key === 'test' && options.test) ||
          (step.key === 'typecheck' && options.typecheck) ||
          (step.key === 'build' && options.build)
        );
      }
      return true; // Run all by default
    });

    let runCount = 0;

    for (const step of stepsToRun) {
      const configuredCmd = verifyConfig[step.key];
      
      // If we don't have it configured and the user explicitly requested it,
      // or if it's the default run and it's missing, let's handle it.
      if (!configuredCmd) {
        if (hasAnyOption) {
          console.log(pc.yellow(`! No command configured for ${step.name} in config.json.`));
          console.log(pc.gray(`Attempting default command: "${step.defaultCmd}"`));
        } else {
          // Skip quietly if not configured in a general run
          continue;
        }
      }

      const cmdToRun = configuredCmd || step.defaultCmd;
      console.log(pc.cyan(`\nRunning ${step.name}: "${cmdToRun}"...`));
      runCount++;

      try {
        // Run command with Cwd, streaming output directly
        execSync(cmdToRun, { cwd: targetDir, stdio: 'inherit' });
        console.log(pc.green(`✓ ${step.name} passed.`));
      } catch (err: any) {
        console.log(pc.red(`\n✗ ${step.name} failed!`));
        process.exit(err.status || 1);
      }
    }

    if (runCount === 0) {
      console.log(pc.yellow('\nNo verify commands were executed. (Make sure they are configured in wlp/config.json)'));
    } else {
      console.log(pc.green(pc.bold('\n✓ Verification completed successfully!\n')));
    }
  });

import { Command } from 'commander';
import pc from 'picocolors';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { execSync } from 'child_process';

export const closeCommand = new Command('close')
  .description('Archive the epic and prompt user to open PR')
  .argument('<slug>', 'The epic slug to close')
  .action((slug) => {
    console.log(pc.blue(pc.bold(`\n[Closing epic] ${slug}\n`)));
    const cwd = process.cwd();
    const activeDir = path.join(cwd, 'wlp/epics', slug);
    const archiveBase = path.join(cwd, 'wlp/archived');

    if (!fs.existsSync(activeDir)) {
      console.log(pc.red(`! Epic '${slug}' not found in active directory.`));
      process.exit(1);
    }

    // 1. Verify all tasks are closed
    const taskFiles = fs.readdirSync(activeDir).filter(f => /^\d+\.md$/.test(f));
    let allClosed = true;
    for (const file of taskFiles) {
      const taskPath = path.join(activeDir, file);
      const parsed = matter(fs.readFileSync(taskPath, 'utf-8'));
      if (parsed.data.status !== 'closed') {
        allClosed = false;
        console.log(pc.yellow(`! Task ${file} is still '${parsed.data.status}'.`));
      }
    }

    if (!allClosed && taskFiles.length > 0) {
       console.log(pc.yellow(`\n! Not all tasks are closed. Ensure all tasks are completed before archiving.`));
       console.log(pc.gray('Bypass this locally if testing by renaming manually.'));
    }

    // 2. Push and Create Pull Request
    const worktreePath = path.join(cwd, '..', '.wlp-worktrees', slug);
    if (fs.existsSync(worktreePath) && fs.existsSync(path.join(worktreePath, '.git'))) {
      try {
        console.log(pc.gray(`\nPushing branch and creating Pull Request...`));
        // Push branch
        execSync(`git -C ${worktreePath} push -u origin epic/${slug}`, { stdio: 'inherit' });
        
        // Create PR using gh CLI
        const title = `Epic: ${slug}`;
        const body = `Automated PR for Epic ${slug}.\n\nCloses epic locally.`;
        execSync(`gh pr create --title "${title}" --body "${body}"`, { cwd: worktreePath, stdio: 'inherit' });
        
        console.log(pc.green(`+ Pull Request created successfully.`));
      } catch (e: any) {
        console.log(pc.yellow(`! Failed to automatically create PR. You may need to push and create it manually.`));
      }
    } else {
      console.log(pc.yellow(`! Worktree not found at ${worktreePath}. Skipping auto-PR creation.`));
    }

    // 3. Move to archive
    if (!fs.existsSync(archiveBase)) {
      fs.mkdirSync(archiveBase, { recursive: true });
    }
    const dateStr = new Date().toISOString().split('T')[0];
    const archiveDir = path.join(archiveBase, `${dateStr}-${slug}`);
    fs.renameSync(activeDir, archiveDir);
    console.log(pc.green(`+ Moved state to ${archiveDir}`));

    console.log(pc.cyan('\nEpic successfully archived locally.'));
    console.log(pc.gray('Review the PR on GitHub and merge it when ready.'));
  });

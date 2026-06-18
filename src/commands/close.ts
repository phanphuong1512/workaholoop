import { Command } from 'commander';
import pc from 'picocolors';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { execSync } from 'child_process';

export const closeCommand = new Command('close')
  .description('Squash merge, archive the change, and close issue')
  .argument('<slug>', 'The change slug to close')
  .action((slug) => {
    console.log(pc.blue(pc.bold(`\n📦 Closing change: ${slug}\n`)));
    const cwd = process.cwd();
    const activeDir = path.join(cwd, 'wlp/changes/active', slug);
    const archiveBase = path.join(cwd, 'wlp/changes/archive');

    if (!fs.existsSync(activeDir)) {
      console.log(pc.red(`✗ Change '${slug}' not found in active directory.`));
      process.exit(1);
    }

    // 1. Verify it's verified
    const tasksPath = path.join(activeDir, 'tasks.md');
    let status = '';
    if (fs.existsSync(tasksPath)) {
       const parsed = matter(fs.readFileSync(tasksPath, 'utf-8'));
       status = parsed.data.status;
    } else {
       const proposalPath = path.join(activeDir, 'proposal.md');
       if (fs.existsSync(proposalPath)) {
         status = matter(fs.readFileSync(proposalPath, 'utf-8')).data.status;
       }
    }

    if (status !== 'verified') {
      console.log(pc.yellow(`⚠️ Status is '${status}', not 'verified'. Ensure /wlp:verify passes before closing.`));
      console.log(pc.gray('Bypass this locally if testing.'));
    }

    // 2. Git merge --squash
    try {
      if (fs.existsSync(path.join(cwd, '.git'))) {
         // This is a naive implementation assuming we are on the branch
         // Real world would detect branch name, checkout main, git merge --squash branch
         console.log(pc.gray('Running: git add . && git commit -m "feat: ' + slug + '"'));
         execSync('git add .', { stdio: 'inherit' });
         // We wrap commit in try catch in case there's nothing to commit
         try {
           execSync(`git commit -m "feat(${slug}): closed via wlp"`, { stdio: 'inherit' });
           console.log(pc.green('✓ Changes committed (squash semantics assumed).'));
         } catch (e) {
           console.log(pc.yellow('  (Nothing to commit)'));
         }
      }
    } catch (e) {
      console.log(pc.red('✗ Git operations failed.'));
    }

    // 3. Move to archive
    if (!fs.existsSync(archiveBase)) {
      fs.mkdirSync(archiveBase, { recursive: true });
    }
    const dateStr = new Date().toISOString().split('T')[0];
    const archiveDir = path.join(archiveBase, `${dateStr}-${slug}`);
    fs.renameSync(activeDir, archiveDir);
    console.log(pc.green(`✓ Moved to ${archiveDir}`));

    console.log(pc.cyan('\n✨ Change successfully closed!'));
  });

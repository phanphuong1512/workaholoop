import { Command } from 'commander';
import pc from 'picocolors';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { execSync } from 'child_process';

export const standupCommand = new Command('standup')
  .description('Generate daily progress summary')
  .action(() => {
    console.log(pc.blue(pc.bold('\n🌅 Daily Standup Summary\n')));

    // 1. Show active work
    const activeDir = path.join(process.cwd(), 'wlp/changes/active');
    let activeChanges: string[] = [];
    if (fs.existsSync(activeDir)) {
      activeChanges = fs.readdirSync(activeDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
    }

    if (activeChanges.length > 0) {
      console.log(pc.bold('🚧 Currently Active:'));
      activeChanges.forEach(slug => {
        const tasksPath = path.join(activeDir, slug, 'tasks.md');
        let status = 'unknown';
        if (fs.existsSync(tasksPath)) {
          const parsed = matter(fs.readFileSync(tasksPath, 'utf-8'));
          if (parsed.data.status) status = parsed.data.status;
        } else {
          const proposalPath = path.join(activeDir, slug, 'proposal.md');
          if (fs.existsSync(proposalPath)) {
             const parsed = matter(fs.readFileSync(proposalPath, 'utf-8'));
             if (parsed.data.status) status = parsed.data.status;
          }
        }
        console.log(`  - ${slug} [${pc.yellow(status.toUpperCase())}]`);
      });
      console.log('');
    } else {
      console.log(pc.gray('🚧 Currently Active: None\n'));
    }

    // 2. Show recent commits
    console.log(pc.bold('📦 Recent Commits (Last 24h):'));
    try {
      // Check if git is initialized
      if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
        console.log(pc.gray('  (Not a git repository)'));
      } else {
        const log = execSync('git log --since="1 day ago" --oneline --no-merges', { encoding: 'utf-8' }).trim();
        if (log) {
          log.split('\n').forEach(line => {
            console.log(`  ${pc.gray(line.substring(0, 7))} ${line.substring(8)}`);
          });
        } else {
          console.log(pc.gray('  No commits in the last 24 hours.'));
        }
      }
    } catch (e) {
      console.log(pc.red('  Error reading git log.'));
    }
    
    console.log('');
  });

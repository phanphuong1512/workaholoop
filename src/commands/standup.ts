import { Command } from 'commander';
import pc from 'picocolors';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { execSync } from 'child_process';

export const standupCommand = new Command('standup')
  .description('Generate daily progress summary')
  .action(() => {
    console.log(pc.blue(pc.bold('\n[Daily Standup Summary]\n')));

    // 1. Show active work
    const epicsDir = path.join(process.cwd(), 'wlp/epics');
    let activeEpics: string[] = [];
    if (fs.existsSync(epicsDir)) {
      activeEpics = fs.readdirSync(epicsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && dirent.name !== 'archived')
        .map(dirent => dirent.name);
    }

    if (activeEpics.length > 0) {
      console.log(pc.bold('Currently Active Epics:'));
      activeEpics.forEach(slug => {
        const epicPath = path.join(epicsDir, slug, 'epic.md');
        let status = 'unknown';
        if (fs.existsSync(epicPath)) {
           const parsed = matter(fs.readFileSync(epicPath, 'utf-8'));
           if (parsed.data.status) status = parsed.data.status;
        }
        console.log(`  - ${slug} [${pc.yellow(status.toUpperCase())}]`);
        
        // Show in-progress tasks
        const tasks = fs.readdirSync(path.join(epicsDir, slug)).filter(f => /^\d+\.md$/.test(f));
        tasks.forEach(file => {
           const parsed = matter(fs.readFileSync(path.join(epicsDir, slug, file), 'utf-8'));
           if (parsed.data.status === 'in-progress' || parsed.data.status === 'active') {
              console.log(`    ↳ Task ${file}: ${parsed.data.name || 'Untitled'}`);
           }
        });
      });
      console.log('');
    } else {
      console.log(pc.gray('Currently Active: None\n'));
    }

    // 2. Show recent commits
    console.log(pc.bold('Recent Commits (Last 24h):'));
    try {
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
